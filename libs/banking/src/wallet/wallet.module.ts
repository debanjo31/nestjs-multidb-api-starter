import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from '@shared/core';
import { WalletService } from './services/wallet.service';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet])],
  providers: [WalletService, ConfigService],
  exports: [WalletService],
})
export class WalletModule {}
