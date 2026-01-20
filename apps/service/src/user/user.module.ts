import { BankingModule } from '@banking/banking';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Account,
  AccountSchema,
  Merchant,
  MerchantSchema,
  UserProfile,
  UserProfileSchema,
  User,
  UserSchema,
} from '@shared/core';
import { UserController } from './controller/user.controller';
import { UserService } from './service/user.service';

@Module({
  imports: [
    BankingModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserProfile.name, schema: UserProfileSchema },
      { name: Merchant.name, schema: MerchantSchema },
      { name: Account.name, schema: AccountSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
