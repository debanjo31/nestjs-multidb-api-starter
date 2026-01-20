import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { PassportStrategy } from '@nestjs/passport';
import { AppException, Auth, AuthDocument } from '@shared/core';
import { Model } from 'mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    @InjectModel(Auth.name) protected readonly model: Model<AuthDocument>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('app.encryptionKey'),
    });
  }

  async validate(payload: Record<string, any>) {
    const auth = await this.model.findOne({ _id: payload.sub });
    if (!auth) {
      throw AppException.INVALID_TOKEN();
    }
    return auth;
    // return {
    //   ...auth.toJSON(),
    //   authId: auth._id,
    // };
  }
}
