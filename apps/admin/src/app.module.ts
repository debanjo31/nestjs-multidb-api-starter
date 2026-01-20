import {
  Logger,
  Module,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configuration } from '../../../config/configuration';
import { CoreModule } from '@shared/core/core.module';
import { AdminAuthModule } from './auth/auth.module';
import { AdminUserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['_env/admin/.env.local', '_env/.env'],
      load: [configuration],
    }),
    CoreModule,
    AdminAuthModule,
    AdminUserModule,
  ],
  controllers: [],
  providers: [],
})

export class AppModule implements OnModuleInit {
  onModuleInit() {
    Logger.log('....initializing APP');
  }
}
