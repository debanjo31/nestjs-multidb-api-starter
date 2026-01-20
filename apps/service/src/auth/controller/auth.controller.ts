import { Body, Controller, HttpCode, Next, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  Auth,
  ChangePasswordDto,
  CurrentUser,
  JwtAuthGuard,
  OK,
  QueryParser,
  ResetCodeDto,
  SendVerificationDto,
  SignInDto,
  SignUpDto,
  SocialLoginDto,
  UpdatePasswordCodeDto,
  Utils,
  VerifyEmailDto,
  VerifyMobileDto,
  Wallet,
} from '@shared/core';
import { NextFunction, Request, Response } from 'express';
import { AuthEmail } from '../auth.email';
import * as _ from 'lodash';
import { AuthSMS } from '../auth.sms';
import lang from '../../../lang';
import { AuthService } from '../service/auth.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(protected service: AuthService, protected config: ConfigService) {}

  @Post('/social-auth/:type')
  @HttpCode(OK)
  @ApiOperation({ summary: 'Social authentication', description: 'Authenticate using social providers (Google, Apple, etc.)' })
  @ApiParam({ name: 'type', description: 'Social provider type (google, apple)', enum: ['google', 'apple'] })
  @ApiBody({ type: SocialLoginDto })
  @ApiResponse({ status: 200, description: 'Authentication successful' })
  @ApiResponse({ status: 401, description: 'Invalid social token' })
  public async socialLogin(
    @Param('type') type: string,
    @Body() socialLoginDto: SocialLoginDto,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    try {
      const queryParser = new QueryParser(Object.assign({}, req.query));
      const { token, auth, user, wallets, account } = await this.service.socialLogin(type, socialLoginDto);
      const response = await this.service.getResponse({
        code: OK,
        token,
        queryParser,
        value: {
          ...(auth?.toJSON() ?? {}),
          ...(user?.toJSON() ?? {}),
          account,
          wallets,
        },
      });
      return res.status(OK).json(response);
    } catch (e) {
      return next(e);
    }
  }

  @Post('/sign-up')
  @HttpCode(OK)
  @ApiOperation({ summary: 'User registration', description: 'Register a new user account' })
  @ApiBody({ type: SignUpDto })
  @ApiResponse({ status: 200, description: 'Registration successful' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  public async signUp(
    @Body() signUpDto: SignUpDto,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    try {
      const queryParser = new QueryParser(Object.assign({}, req.query));
      const { token, auth, user, wallets, account } = await this.service.signUp(signUpDto);
      const userWallets = wallets as Wallet[];
      let OTPCall: Record<string, any> = {};
      if (auth?.email) {
        OTPCall = {
          email: await AuthEmail.verifyEmail(
            {
              from: this.config.get<string>('app.fromEmail') ?? '',
              template: this.config.get<string>('app.templates.email.verify') ?? '',
              verificationCodes: auth.verificationCodes?.email?.code,
            },
            {
              ...(auth?.toJSON() ?? {}),
              fullName: AuthService.getEmailFullName(signUpDto.profileType, account),
            },
          ),
        };
      }
      const response = await this.service.getResponse({
        code: OK,
        token,
        ...OTPCall,
        queryParser,
        hiddenFields: ['verificationCodes'],
        value: {
          ...(auth?.toJSON() ?? {}),
          ...(user?.toJSON() ?? {}),
          account,
          wallets: userWallets.map((w) => ({ ..._.omit(w, ['id']) })),
        },
      });
      return res.status(OK).json(response);
    } catch (e) {
      return next(e);
    }
  }

  @Post('/sign-in')
  @HttpCode(OK)
  @ApiOperation({ summary: 'User sign in', description: 'Authenticate user with email and password' })
  @ApiBody({ type: SignInDto })
  @ApiResponse({ status: 200, description: 'Login successful, returns JWT token' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 404, description: 'User not found' })
  public async signIn(
    @Body() signInDto: SignInDto,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    try {
      const queryParser = new QueryParser(Object.assign({}, req.query));
      const { token, auth, user } = await this.service.signIn(signInDto);
      const response = await this.service.getResponse({
        queryParser,
        token,
        code: OK,
        hiddenFields: ['password', 'verificationCodes'],
        value: { ...auth.toJSON(), ...(user?.toJSON() ?? {}) },
      });
      return res.status(OK).json(response);
    } catch (e) {
      return next(e);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('/send-verification')
  @HttpCode(OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Send verification code', description: 'Send verification code to email or mobile' })
  @ApiBody({ type: SendVerificationDto })
  @ApiResponse({ status: 200, description: 'Verification code sent' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  public async sendVerification(
    @CurrentUser() authUser: Auth,
    @Body() sendVerification: SendVerificationDto,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    try {
      const { auth, user, account } = await this.service.sendVerification(authUser, sendVerification);
      const mobile = _.get(account, ['basicInformation', 'mobileInformation', 'mobile']) as string;
      const { type } = sendVerification;
      const isMobile = type === 'mobile';
      let filter: any = {
        email: await AuthEmail.verifyEmail(
          {
            from: this.config.get<string>('app.fromEmail') ?? '',
            template: this.config.get<string>('app.templates.email.verify') ?? '',
            verificationCodes: auth?.verificationCodes?.email?.code,
          },
          {
            ...(auth?.toJSON() ?? {}),
            fullName: AuthService.getEmailFullName(user?.profileType ?? '', account),
          },
        ),
      };
      if (isMobile) {
        filter = {
          sms: await AuthSMS.verifyMobile(
            {
              template: this.config.get<string>('app.templates.sms.verify') ?? '',
              verificationCodes: auth?.verificationCodes?.mobile?.code,
              isoCode: sendVerification.mobile.isoCode,
            },
            sendVerification.mobile.mobile,
          ),
        };
        filter = _.omit(filter, ['email']);
      }
      let message = `${user?.email?.substring(0, 5) ?? ''}****`;
      if (isMobile) {
        const isoCode = isMobile ? Utils.getCountryCallingCode(sendVerification.mobile.isoCode) : 'NG';
        const mobileNumber = mobile ?? sendVerification.mobile.mobile;
        message = `Verification code resent to ${`${`${isoCode}${mobileNumber}`.substring(0, 7)}****`}`;
      }
      const response = await this.service.getResponse({
        code: OK,
        ...filter,
        message,
        value: {
          ..._.pick(auth, ['verifications']),
        },
      });
      return res.status(OK).json(response);
    } catch (e) {
      return next(e);
    }
  }

  @Post('/verify-email')
  @HttpCode(OK)
  @ApiOperation({ summary: 'Verify email', description: 'Verify email address with verification code' })
  @ApiBody({ type: VerifyEmailDto })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired verification code' })
  public async verifyEmail(
    @Body() verifyEmailDto: VerifyEmailDto,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    try {
      const queryParser = new QueryParser(Object.assign({}, req.query));
      const auth = await this.service.verifyEmail(verifyEmailDto);
      const response = await this.service.getResponse({
        queryParser,
        code: OK,
        hiddenFields: ['password'],
        value: { ...auth.toJSON() },
      });
      return res.status(OK).json(response);
    } catch (e) {
      return next(e);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('/verify-mobile')
  @HttpCode(OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Verify mobile', description: 'Verify mobile number with verification code' })
  @ApiBody({ type: VerifyMobileDto })
  @ApiResponse({ status: 200, description: 'Mobile verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired verification code' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  public async verifyMobile(
    @CurrentUser() authUser: Auth,
    @Body() verifyMobileDto: VerifyMobileDto,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    try {
      const queryParser = new QueryParser(Object.assign({}, req.query));
      const auth = await this.service.verifyMobile(authUser, verifyMobileDto);
      const response = await this.service.getResponse({
        queryParser,
        code: OK,
        hiddenFields: ['password'],
        value: { ...auth.toJSON() },
      });
      return res.status(OK).json(response);
    } catch (e) {
      return next(e);
    }
  }

  @Post('/reset-password')
  @HttpCode(OK)
  @ApiOperation({ summary: 'Request password reset', description: 'Send password reset code to email or mobile' })
  @ApiBody({ type: ResetCodeDto })
  @ApiResponse({ status: 200, description: 'Reset code sent successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  public async resetPassword(
    @Body() resetCodeDto: ResetCodeDto,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    try {
      const { auth, account, user } = await this.service.requestPasswordReset(resetCodeDto);
      const type = resetCodeDto.email ? 'email' : 'mobile';
      let filter: any = {
        email: await AuthEmail.verifyEmail(
          {
            from: this.config.get<string>('app.fromEmail') ?? '',
            template: this.config.get<string>('app.templates.email.resetPassword') ?? '',
            subject: 'Reset password verification',
            verificationCodes: auth.verificationCodes?.resetPassword?.code,
          },
          {
            ...auth.toJSON(),
            fullName: AuthService.getEmailFullName(user?.profileType ?? '', account),
          },
        ),
      };
      if (type === 'mobile') {
        // todo send SMS to queue
        filter = {
          sms: {},
        };
        filter = _.omit(filter, ['email']);
      }
      const messageType = {
        email: `A reset code sent to ${user?.email ?? ''}`,
        mobile: `A reset code sent to ${_.get(account, ['basicInformation', 'mobileInformation', 'mobile'])}`,
      };
      const response = await this.service.getResponse({
        code: OK,
        hiddenFields: ['password'],
        message: messageType[type],
        ...filter,
        value: {
          success: true,
        },
      });
      return res.status(OK).json(response);
    } catch (e) {
      return next(e);
    }
  }

  @Post('/update-password')
  @HttpCode(OK)
  @ApiOperation({ summary: 'Update password with reset code', description: 'Update password using the reset code' })
  @ApiBody({ type: UpdatePasswordCodeDto })
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired reset code' })
  public async updatePassword(
    @Body() updatePasswordDto: UpdatePasswordCodeDto,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    try {
      const { auth, token } = await this.service.updatePassword(updatePasswordDto);
      const response = await this.service.getResponse({
        code: OK,
        token,
        hiddenFields: ['password'],
        value: { ...auth.toJSON() },
      });
      return res.status(OK).json(response);
    } catch (e) {
      return next(e);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('/change-password')
  @HttpCode(OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Change password', description: 'Change password for authenticated user' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Current password is incorrect' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  public async changePassword(
    @CurrentUser() authUser: Auth,
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    try {
      const auth = await this.service.changePassword(authUser._id, changePasswordDto);
      const response = await this.service.getResponse({
        code: OK,
        message: lang.get('auth').passwordChanged,
        value: {
          email: auth.email,
          success: true,
        },
      });
      return res.status(OK).json(response);
    } catch (e) {
      return next(e);
    }
  }
}
