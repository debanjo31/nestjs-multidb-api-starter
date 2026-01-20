import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { PassportStrategy } from '@nestjs/passport';
import { AppException, AdminAuth, AdminAuthDocument } from '@shared/core';
import { Model } from 'mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  constructor(
    config: ConfigService,
    @InjectModel(AdminAuth.name) protected readonly model: Model<AdminAuthDocument>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('app.encryptionKey'),
    });
  }

  async validate(payload: Record<string, any>) {
    const admin = await this.model.findOne({ _id: payload.sub, active: true, deleted: false });
    if (!admin) {
      throw AppException.INVALID_TOKEN();
    }
    return admin;
  }
}
