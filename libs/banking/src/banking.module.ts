import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { WalletModule } from './wallet';

@Global()
@Module({
  imports: [HttpModule, WalletModule],
  providers: [],
  exports: [WalletModule],
})
export class BankingModule {}
