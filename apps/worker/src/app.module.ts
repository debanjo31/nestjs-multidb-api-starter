import { configuration } from '@config';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CoreModule } from '@shared/core/core.module';
import { AppController } from './app.controller';
import { JobModule } from './job/job.module';
import { MediaModule } from './media/media.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        '_env/worker/.env.local',
        '_env/.env',
        '_env/worker/.env.test',
      ],
      load: [configuration],
    }),
    CoreModule,
    MediaModule,
    JobModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
