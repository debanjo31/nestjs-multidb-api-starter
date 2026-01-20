/* eslint-disable prefer-const */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Account,
  AccountDocument,
  AppException,
  Auth,
  AuthDocument,
  ChangePasswordDto,
  MongoBaseService,
  ProfileType,
  ResetCodeDto,
  ResponseOption,
  SendVerificationDto,
  SignInDto,
  SocialLoginDto,
  UpdatePasswordCodeDto,
  User,
  UserDocument,
  Utils,
  VerifyEmailDto,
  VerifyMobileDto,
  WorkService,
} from '@shared/core';
import { WalletService } from '@banking/banking';
import { ClientSession, Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { SignUpDto } from '@shared/core/shared/dto/auth/sign-up.dto';
import lang from '../../../lang';
import * as bcrypt from 'bcryptjs';
import * as _ from 'lodash';
import { UserService } from '../../user/service/user.service';
import { AccountService } from '../../account/service/account.service';


@Injectable()
export class AuthService extends MongoBaseService {
  constructor(
    @InjectModel(Auth.name) protected model: Model<AuthDocument>,
    @InjectModel(User.name) protected userModel: Model<UserDocument>,
    @InjectModel(Account.name) protected accountModel: Model<AccountDocument>,
    protected config: ConfigService,
    protected userService: UserService,
    protected accountService: AccountService,
    protected walletService: WalletService,
    private jwtService: JwtService,
    private httpService: HttpService,
    private workerService: WorkService,
  ) {
    super(model);
  }

  /**
   * @param {SignUpDto} signUpDto sign up payload
   * @return {Object} The success response object
   */
  public async socialLogin(type = 'facebook', { email, accessToken, socialId, profileType }: SocialLoginDto) {
    let session: ClientSession | undefined;
    try {
      session = await this.model.startSession();
      const obj = {};
      const profile = { basicInformation: {} };
      session.startTransaction();
      const urls = {
        facebook: `${this.config.get('app.social.facebook.GraphUrl')}&access_token=${accessToken}`,
        google: `${this.config.get('app.social.google.url')}?access_token=${accessToken}`,
        apple: '',
      };
      return this.httpService
        .get(urls[type])
        .toPromise()
        .then(async (resp) => {
          if (!resp?.data) {
            throw AppException.UNAUTHORIZED(lang.get('auth').socialError);
          }
          const response = resp;
          const socialID = type === 'facebook' ? response.data.id : response.data.sub;
          if (socialId) {
            if (socialID === socialId) {
              _.extend(obj, {
                account_verified: true,
                socialId: socialID,
                socialAuth: true,
                socialAuthType: type,
              });
              if (email && response.data.email === email) {
                _.extend(obj, { email, verification: { email: true } });
              }
              if (response.data.name) {
                const name = response.data.name.split(' ');
                const lastName = name[0] ? name[0] : '';
                const firstName = name[1] ? name[1] : '';
                _.extend(profile.basicInformation, {
                  lastName,
                  firstName,
                });
              }
              if (response.data.last_name) {
                _.extend(profile.basicInformation, {
                  lastName: response.data.last_name,
                });
              }
              if (response.data.first_name) {
                _.extend(profile.basicInformation, {
                  firstName: response.data.first_name,
                });
              }
              _.extend(obj, { profile, profileType });
              let auth = await this.model.findOne({
                $or: [{ socialId, email }],
              });
              if (!auth) {
                auth = await this.model.findOneAndUpdate(
                  { email },
                  {
                    ...obj,
                    $setOnInsert: {
                      publicId: Utils.generateUniqueId('auth'),
                    },
                  },
                  {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true,
                    session,
                  },
                );
                if (!auth) {
                  throw AppException.INTERNAL_SERVER('Failed to create auth', []);
                }
                const payload = {
                  _id: auth._id,
                  email,
                  profileType: profileType || ProfileType.User,
                  profile: {
                    user: auth._id,
                    ...profile,
                  },
                };
                const { token, user, account, wallets } = await this.prepareUserData(payload, session!);
                await session!.commitTransaction();
                return {
                  auth,
                  token,
                  user,
                  account,
                  wallets,
                };
              }
              const [user, account] = await Promise.all([
                await this.userModel.findById(auth._id),
                await this.accountModel.findOne({ owner: auth._id }),
              ]);
              const [token, wallets] = await Promise.all([
                this.jwtService.sign(AuthService.getJwtPayload(user!, account!)),
                await this.walletService.getUserWallet({
                  user: user?.publicId,
                  account: account?.publicId,
                }),
              ]);
              return {
                user,
                auth,
                account,
                token,
                wallets: Array.isArray(wallets) ? wallets.map((w) => ({ ..._.omit(w, ['id']) })) : [{ ..._.omit(wallets, ['id']) }],
              };
            }
          }
          throw AppException.UNAUTHORIZED(lang.get('auth').socialError);
        });
    } catch (e) {
      await session?.abortTransaction();
      throw AppException.UNAUTHORIZED(lang.get('auth').socialError);
    }
  }

  /**
   * @param {SignUpDto} signUpDto sign up payload
   * @return {Object} The success response object
   */
  public async signUp(signUpDto: SignUpDto) {
    let session: ClientSession | undefined;
    try {
      session = await this.model.startSession();
      session.startTransaction();
      const { email, password } = signUpDto;
      let auth = await this.model.findOne({ email });
      if (auth) {
        throw AppException.CONFLICT(lang.get('auth').userExist);
      }
      const hashPassword = await bcrypt.hash(password, 10);
      const expiration = Utils.addHourToDate(1);
      const code = this.getCode();
      const filter: any = { email };
      const verificationCode: Record<string, any> = {
        'verificationCodes.email': { code, expiration },
      };
      auth = await this.model.findOneAndUpdate(
        filter,
        {
          $setOnInsert: {
            publicId: Utils.generateUniqueId('auth'),
          },
          password: hashPassword,
          $set: verificationCode,
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
          session,
        },
      );
      if (!auth) {
        throw AppException.INTERNAL_SERVER('Failed to create auth', []);
      }
      const payload = {
        _id: auth._id,
        ...signUpDto,
        profile: {
          user: auth._id,
          basicInformation: {
            ..._.pick(signUpDto, ['firstName', 'lastName']),
          },
        },
      };
      const { token, user, account, wallets } = await this.prepareUserData(payload, session);
      await session.commitTransaction();
      return {
        auth,
        token,
        account,
        user,
        wallets,
      };
    } catch (err) {
      if (session) await session?.abortTransaction();
      throw err;
    } finally {
      if (session) await session?.endSession();
    }
  }

  /**
   * @param {SignInDto} signUpDto sign in payload
   * @return {Object} The success response object
   */
  public async signIn(signUpDto: SignInDto) {
    try {
      const auth = await this.model.findOne({ email: signUpDto.email }).select('+password');
      if (!auth) {
        throw AppException.NOT_FOUND(lang.get('auth').authenticationFailure);
      }
      const isAuthenticated = await bcrypt.compare(signUpDto.password, auth.password);
      if (!isAuthenticated) {
        throw AppException.UNAUTHORIZED(lang.get('auth').authenticationFailure);
      }
      const [user, account] = await Promise.all([
        this.userModel.findOne({ auth: auth._id }),
        this.accountModel.findOne({ owner: auth._id }),
      ]);
      if (!user) {
        throw AppException.NOT_FOUND(lang.get('auth').authenticationFailure);
      }
      const jwtPayload = AuthService.getJwtPayload(user, account!);
      const token = this.jwtService.sign(jwtPayload);
      return {
        token,
        auth,
        user,
      };
    } catch (e) {
      throw e;
    }
  }

  /**
   * @return {String} return code
   */
  private async prepareUserData(payload: Record<string, any>, session: ClientSession) {
    const { user, account } = await this.userService.createNewObject({ ...payload }, session);
    const wallets = await this.walletService.getUserWallet({
      email: user.email,
      user: user.publicId,
      account: account?.publicId,
    });
    const tokenPayload = AuthService.getJwtPayload(user, account);
    const token = this.jwtService.sign(tokenPayload);
    return {
      user,
      account,
      token,
      wallets,
    };
  }

  /**
   * @param {Object} authUser The authenticated user
   * @param {SendVerificationDto} resendVerification The payload subject
   * @return {Object}
   */
  public async sendVerification(authUser: Auth, resendVerification: SendVerificationDto) {
    try {
      const { type } = resendVerification;
      const isMobile = type === 'mobile';
      const isEmail = type === 'email';
      let [auth, user, account] = await Promise.all([
        this.model.findOne({
          _id: authUser._id,
        }),
        this.userModel.findById(authUser._id),
        this.accountModel.findOne({ owner: authUser._id }),
      ]);
      if (!auth || !user || !account) {
        throw AppException.NOT_FOUND(lang.get('error').notFound);
      }
      const mobile = account.basicInformation?.mobileInformation;
      if (
        (isEmail && auth.email?.toLowerCase() === resendVerification.email?.toLowerCase()) ||
        (isMobile && mobile && String(mobile.mobile) === String(resendVerification.mobile?.mobile))
      ) {
        if (authUser.verifications?.[type]) {
          throw AppException.CONFLICT(lang.get('auth').dataVerified);
        }
      }

      if (
        isMobile &&
        (!mobile?.isoCode ||
          _.isEmpty(mobile.isoCode) ||
          !mobile?.mobile ||
          _.isEmpty(mobile.mobile))
      ) {
        const found = await this.accountModel.find({
          'basicInformation.mobileInformation.mobile': String(resendVerification.mobile?.mobile),
        });
        if (found && found.length) {
          throw AppException.CONFLICT(lang.get('auth').duplicatePhoneNumber);
        }
        _.extend(account, {
          basicInformation: {
            ...account.basicInformation,
            mobileInformation: {
              isoCode: resendVerification.mobile?.isoCode,
              mobile: resendVerification.mobile?.mobile,
            },
          },
        });
      }
      const expiration = Utils.addHourToDate(1);
      const code = this.getCode();
      auth.verificationCodes = {
        ...auth.verificationCodes,
        [type]: { code, expiration },
      };
      if (
        resendVerification.type === 'email' &&
        auth.email?.toLowerCase() !== resendVerification.email?.toLowerCase()
      ) {
        const foundAuth = await this.model.find({ email: resendVerification.email });
        if (foundAuth && foundAuth.length) {
          throw AppException.CONFLICT(lang.get('auth').duplicateEmail);
        }
        if (auth.verifications) auth.verifications.email = false;
        auth.email = resendVerification.email;
        account.email = resendVerification.email;
        user.email = resendVerification.email;
      } else if (
        resendVerification.type === 'mobile' &&
        mobile?.mobile !== resendVerification.mobile?.mobile
      ) {
        const found = await this.accountModel.find({
          'basicInformation.mobileInformation.mobile': String(resendVerification.mobile?.mobile),
        });
        if (found && found.length) {
          throw AppException.CONFLICT(lang.get('auth').duplicatePhoneNumber);
        }
        if (auth.verifications) auth.verifications.mobile = false;
        _.extend(account, {
          basicInformation: {
            ...account.basicInformation,
            mobileInformation: {
              isoCode: resendVerification.mobile?.isoCode,
              mobile: resendVerification.mobile?.mobile,
            },
          },
        });
      }
      await Promise.all([account.save(), auth.save(), user.save()]);
      return {
        auth,
        user,
        account,
      };
    } catch (e) {
      throw e;
    }
  }

  /**
   * @param {VerifyEmailDto} verifyEmailDto The payload object
   * @return {Object}
   */
  public async verifyEmail({ email, verificationCode }: VerifyEmailDto) {
    try {
      const auth = await this.model.findOne({
        email,
      });
      if (!auth) {
        throw AppException.NOT_FOUND(lang.get('error').notFound);
      }
      const canVerifyError = await this.canVerify(
        {
          verified: auth.verifications?.email,
          expiration: auth.verificationCodes?.email?.expiration,
          code: auth.verificationCodes?.email?.code,
        },
        {
          code: verificationCode,
        },
      );
      if (canVerifyError) {
        throw canVerifyError;
      }
      const { verifications, verificationCodes } = Utils.updateVerification(auth, 'email');
      auth.verificationCodes = verificationCodes;
      auth.verifications = verifications;
      return await auth.save();
    } catch (err) {
      throw err;
    }
  }

  /**
   * @param {VerifyMobileDto} verifyEmailDto The payload object
   * @return {Object}
   */
  public async verifyMobile(authUser: Auth, { mobile, verificationCode }: VerifyMobileDto) {
    try {
      const auth = await this.model.findById(authUser._id);
      if (!auth) {
        throw AppException.NOT_FOUND(lang.get('error').notFound);
      }
      const account = await this.accountModel.findOne({
        owner: auth._id,
        'basicInformation.mobileInformation.mobile': mobile.mobile,
      });
      if (!account) {
        throw AppException.NOT_FOUND(lang.get('error').notFound);
      }
      const canVerifyError = await this.canVerify(
        {
          verified: auth.verifications?.mobile,
          expiration: auth.verificationCodes?.mobile?.expiration,
          code: auth.verificationCodes?.mobile?.code,
        },
        {
          code: verificationCode,
        },
      );
      if (canVerifyError) {
        throw canVerifyError;
      }
      const { verifications, verificationCodes } = Utils.updateVerification(auth, 'mobile');
      auth.verificationCodes = verificationCodes;
      auth.verifications = { ...verifications, accountVerified: auth.verifications?.email && auth.verifications?.mobile };
      return await auth.save();
    } catch (err) {
      throw err;
    }
  }

  /**
   * @param  {Object} authData The auth object
   * @param {Object} payloadData The payload data
   * @return {Object} returns error or null for pass
   */
  async canVerify(authData: Record<string, any>, payloadData: Record<string, any>) {
    const { verified, code, expiration } = authData;
    if (verified) {
      throw AppException.UNAUTHORIZED(lang.get('auth').dataVerified);
    }
    if (payloadData.code) {
      if (code !== payloadData.code) {
        return AppException.UNAUTHORIZED(lang.get('auth').invalidCode);
      }
      if (new Date() > new Date(expiration)) {
        return AppException.UNAUTHORIZED(lang.get('auth').expiredCode);
      }
    }
    return null;
  }

  /**
   * @param {User} user The main property
   * @param {Account} account The main property
   * @return {Object} returns the main error if main cannot be verified
   */
  static getJwtPayload(user: User, account: Account) {
    return {
      authId: user.publicId,
      account: account.publicId,
      sub: user._id,
      profileType: user.profileType,
    };
  }

  /**
   * @param {ResetCodeDto} payload The payload object
   * @return {Object}
   */
  public async requestPasswordReset(payload: ResetCodeDto) {
    const account = await this.findByEmailOrMobile(payload, this.accountModel);
    if (!account) {
      throw AppException.NOT_FOUND(lang.get('error').notFound);
    }
    const ownerId = _.isObject(account.owner) ? (account.owner as any)._id : account.owner;
    const [auth, user] = await Promise.all([
      this.model.findById(ownerId),
      this.userModel.findById(ownerId),
    ]);
    if (!auth) {
      throw AppException.NOT_FOUND(lang.get('error').notFound);
    }
    const expiration = Utils.addHourToDate(1);
    const code = this.getCode();
    auth.verificationCodes = {
      ...auth.verificationCodes,
      resetPassword: { code, expiration },
    };
    const savedAuth = await auth.save();
    return { auth: savedAuth, account, user };
  }

  /**
   * @param {Object} payload The payload object
   * @param {Object} model The model to execute the search
   * @param {Object} session The session
   * @return {Object} return the found object
   */
  public async findByEmailOrMobile(
    payload: Record<string, any>,
    model: Model<AccountDocument>,
    session?: ClientSession,
  ) {
    const { mobile, email } = payload;
    const filters: Record<string, any>[] = [];
    if (email) {
      filters.push({ email });
    }
    if (mobile && _.isEmpty(filters)) {
      filters.push({
        'basicInformation.mobileInformation.mobile': mobile.mobile,
      });
    }
    return model.findOne({ $or: filters }).session(session ?? null).populate('owner');
  }

  /**
   * @param {VerifyEmailDto} verifyEmailDto The payload object
   * @return {Object}
   */
  public async updatePassword(payload: UpdatePasswordCodeDto) {
    try {
      const account = await this.findByEmailOrMobile(payload, this.accountModel);
      if (!account) {
        throw AppException.NOT_FOUND(lang.get('error').notFound);
      }
      const ownerId = _.isObject(account.owner) ? (account.owner as any)._id : account.owner;
      const [auth, user] = await Promise.all([
        this.model.findById(ownerId),
        this.userModel.findById(ownerId),
      ]);
      if (!auth || !user) {
        throw AppException.NOT_FOUND(lang.get('error').notFound);
      }
      const cannotResetError = await this.cannotResetPassword(
        {
          verified: auth.verifications?.email,
          expiration: auth.verificationCodes?.resetPassword?.expiration,
          code: auth.verificationCodes?.resetPassword?.code,
        },
        {
          code: payload.verificationCode,
        },
      );
      if (cannotResetError) {
        throw cannotResetError;
      }
      auth.password = await bcrypt.hash(payload.password, 10);
      auth.verificationCodes = _.omit({ ...auth.verificationCodes }, ['resetPassword']);
      const savedAuth = await auth.save();
      const token = await this.jwtService.sign(AuthService.getJwtPayload(user, account));
      return { auth: savedAuth, account, user, token };
    } catch (err) {
      throw err;
    }
  }

  /**
   * @param {Object} authData The main property
   * @param {Object} payloadData The object properties
   * @return {Object} returns the main error if main cannot be verified
   */
  public async cannotResetPassword(authData: Record<string, any>, payloadData: Record<string, any>) {
    if (!authData.code) {
      throw AppException.UNAUTHORIZED(lang.get('error').unAuthorized);
    }
    if (authData.code !== payloadData.code) {
      return AppException.UNAUTHORIZED(lang.get('auth').invalidCode);
    }
    if (new Date() > new Date(authData.expiration)) {
      return AppException.UNAUTHORIZED(lang.get('auth').expiredCode);
    }
    return null;
  }

  /**
   * @param {ResponseOption} option should throw error if true
   * @return {Object} The success response object
   */
  public async getResponse(option: ResponseOption) {
    if (option.email) {
      this.workerService.queueToSendEmail(option.email);
    }
    // TODO: Implement SMS queueing when WorkService.queueToSendSms is available
    return await super.getResponse(option);
  }

  /**
   * Change the password for a user.
   *
   * @param {string} authId - The ID of the user whose password is being changed.
   * @param {ChangePasswordDto} payload - The new password and current password.
   * @return {Promise<Partial<Auth>>} - The updated user information, without the password and verification codes.
   * @throws {AppException} - If the current password is incorrect.
   */
  public async changePassword(authId: string, payload: ChangePasswordDto): Promise<Partial<Auth>> {
    let auth = await this.model.findById(authId).select('+password');
    if (!auth) {
      throw AppException.NOT_FOUND(lang.get('error').notFound);
    }

    const isAuthenticated = await bcrypt.compare(payload.currentPassword, auth.password);
    if (!isAuthenticated) {
      throw AppException.UNAUTHORIZED(lang.get('auth').invalidUser);
    }

    auth.password = await bcrypt.hash(payload.password, 10);
    auth = await auth.save();

    return _.omit(auth.toJSON(), ['password', 'verificationCodes']);
  }

  /**
   *
   * @param {Object} type The type property
   * @param {Object} user The user property
   * @param {Object} account The user property
   * @return {String} String value
   */
  public static getEmailFullName(type: string, account: Account) {
    const firstName = `${_.get(account, ['basicInformation', 'firstName'])}`;
    const lastName = `${_.get(account, ['basicInformation', 'lastName'])}`;
    const companyName = `${_.get(account, ['companyName'])}`;
    return type === ProfileType.User ? `${firstName} ${lastName}` : companyName;
  }

  async validateUser(username: string, password: string) {
    const auth = await this.model.findOne({ email: username }).select('+password');
    if (!auth) {
      return null;
    }
    const isValidPass = await bcrypt.compare(password, auth.password);
    return isValidPass ? auth : null;
  }

  /**
   * @return {String} return code
   */
  private getCode() {
    return this.config.get('app.environment') === 'production' ? Utils.generateCode(6) : '123456';
  }
}
