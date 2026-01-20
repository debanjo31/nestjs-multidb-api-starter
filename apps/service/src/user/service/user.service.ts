import { InjectModel } from '@nestjs/mongoose';
import {
  Account,
  AccountDocument,
  Merchant,
  MerchantDocument,
  MongoBaseService,
  ProfileType,
  UserProfile,
  UserProfileDocument,
  User,
  UserDocument,
  Utils,
} from '@shared/core';
import { ClientSession } from 'mongodb';
import { Model, Types } from 'mongoose';
import * as _ from 'lodash';
import { WalletService } from '@banking/banking';

export class UserService extends MongoBaseService {
  constructor(
    @InjectModel(User.name)
    protected model: Model<UserDocument>,
    @InjectModel(UserProfile.name)
    public readonly userProfileModel: Model<UserProfileDocument>,
    @InjectModel(Merchant.name)
    public readonly merchantModel: Model<MerchantDocument>,
    @InjectModel(Account.name)
    public readonly accountModel: Model<AccountDocument>,
    protected walletService: WalletService,
  ) {
    super(model);
  }

  /**
   * @param {Object} obj The payload object
   * @param {ClientSession} session The session object
   * @return {Object}
   */
  public async createNewObject(
    obj: Record<string, any>,
    session?: ClientSession,
  ) {
    try {
      const { _id, email, profileType } = obj;
      const { profile, account } = await this.createOrUpdateProfile(
        obj,
        session,
      );
      const user = await this.model.findOneAndUpdate(
        { _id, email },
        {
          profileType,
          $setOnInsert: {
            publicId: Utils.generateUniqueId('usr'),
            _id,
            auth: _id,
            email,
            profile: profile._id,
          },
        },
        {
          upsert: true,
          new: true,
          session,
        },
      );
      return { user, account };
    } catch (e) {
      throw e;
    }
  }

  /**
   * @param {String} authId The payload object
   * @return {Object}
   */
  public async currentUser(authId: string) {
    const [user, account] = await Promise.all([
      await this.model.findById(authId).populate('profile').lean(),
      await this.accountModel.findOne({ user: authId }).lean(),
    ]);
    if (!user) {
      throw new Error('User not found');
    }
    const wallet = await this.walletService.getUserWallet({
      user: user.publicId,
    });
    return {
      ...user,
      account,
      wallet,
    };
  }

  /**
   * @param {Object} obj The payload object
   * @param {Object} session The payload object
   * @return {Object}
   */
  public async createOrUpdateProfile(obj: any, session?: any): Promise<any> {
    try {
      const { email, _id, profileType, profile } = obj;
      const companyName = _.get(obj, ['business', 'company_name']);
      const Profile: any = this.getProfileModel(profileType);
      const currentProfileType = profileType || ProfileType.User;
      let updateCondition: any = { user: _id, _id: new Types.ObjectId() };
      if (
        currentProfileType === ProfileType.User ||
        currentProfileType === ProfileType.Merchant
      ) {
        updateCondition = { user: _id, email };
      }
      if (profile && profile._id) {
        updateCondition['_id'] = profile._id;
      }
      const account = await this.accountModel.findOneAndUpdate(
        { owner: _id },
        {
          $setOnInsert: {
            owner: _id,
            email,
            publicId: Utils.generateUniqueId('account'),
          },
          companyName: companyName || undefined,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true, session },
      );
      const profilePayload = _.pick(profile, Profile.config().updateFillables);
      const payload = {
        ...profilePayload,
        $setOnInsert: {
          ...profile,
          email,
          user: _id,
          account: account?._id,
          publicId: Utils.generateUniqueId(Profile.config().idToken),
        },
      };
      const savedProfile = await Profile.findOneAndUpdate(
        updateCondition,
        payload,
        {
          upsert: true,
          new: true,
          setDefaultOnInsert: true,
          useFindAndModify: true,
          session,
        },
      );
      return { profile: savedProfile, account };
    } catch (e) {
      throw e;
    }
  }

  /**
   * @param {Object} profileType The payload object
   * @return {Object}
   */
  public getProfileModel(profileType: string) {
    switch (profileType) {
      case ProfileType.Merchant:
        return this.merchantModel;
      case ProfileType.User:
        return this.userProfileModel;
      default:
        return this.userProfileModel;
    }
  }
}
