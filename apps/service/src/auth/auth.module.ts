import { HttpModule } from '@nestjs/axios';
import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { Account, AccountSchema, Auth, AuthSchema, User, UserSchema } from '@shared/core';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './service/auth.service';
import { BankingModule } from '@banking/banking';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt-auth.strategy';
import { AuthController } from './controller/auth.controller';
import { UserModule } from '../user';
import { AccountModule } from '../account';

@Global()
@Module({
  imports: [
    HttpModule,
    BankingModule,
    UserModule,
    AccountModule,
    MongooseModule.forFeature([
      { name: Auth.name, schema: AuthSchema },
      { name: User.name, schema: UserSchema },
      { name: Account.name, schema: AccountSchema },
    ]),
    PassportModule,
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => {
        return {
          defaultStrategy: 'jwt',
          secret: config.get<string>('app.encryptionKey'),
          signOptions: { expiresIn: '60d' },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
