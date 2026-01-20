import { BankingModule, WalletModule } from '@banking/banking';
import { configuration } from '@config';
import {
  Logger,
  MiddlewareConsumer,
  Module,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CoreModule } from '@shared/core/core.module';
import { AccountModule } from './account';
import { AuthModule } from './auth';
import { UserModule } from './user';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['_env/service/.env.local', '_env/.env'],
      load: [configuration],
    }),
    CoreModule,
    UserModule,
    AuthModule,
    WalletModule,
    BankingModule,
    AccountModule,
  ],
  controllers: [],
  providers: [],
})

export class AppModule implements OnModuleInit {
  onModuleInit() {
    Logger.log('....initializing SERVICE APP');
  }
}
