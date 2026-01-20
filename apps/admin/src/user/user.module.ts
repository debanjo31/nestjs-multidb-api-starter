import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Account,
  AccountSchema,
  Auth,
  AuthSchema,
  User,
  UserSchema,
} from '@shared/core';
import { AdminUserController } from './controller/admin-user.controller';
import { AdminUserService } from './service/admin-user.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Auth.name, schema: AuthSchema },
      { name: Account.name, schema: AccountSchema },
    ]),
  ],
  controllers: [AdminUserController],
  providers: [AdminUserService],
  exports: [AdminUserService],
})
export class AdminUserModule {}
