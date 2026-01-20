import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminAuth, AdminAuthSchema } from '@shared/core';
import { AdminAuthController } from './controller/admin-auth.controller';
import { AdminAuthService } from './service/admin-auth.service';
import { AdminJwtStrategy } from './strategies/admin-jwt.strategy';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AdminAuth.name, schema: AdminAuthSchema },
    ]),
    PassportModule.register({ defaultStrategy: 'admin-jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('app.encryptionKey'),
        signOptions: {
          expiresIn: config.get<number>('app.jwtExpiration') ?? 172800,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AdminAuthController],
  providers: [AdminAuthService, AdminJwtStrategy],
  exports: [AdminAuthService],
})
export class AdminAuthModule {}
