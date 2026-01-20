import { configuration } from '@config';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { CoreModule } from '@shared/core/core.module';
import { AppController } from './app.controller';
import { UserProxyMiddleware } from './middleware/user-proxy';
import { WorkerProxyMiddleware } from './middleware/worker-proxy';
import { AdminProxyMiddleware } from './middleware/admin-proxy';
import { UserService } from './rest/user-service';
import { WorkerService } from './rest/worker';
import { AdminService } from './rest/admin-service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        '_env/gateway/.env.local',
        '_env/.env',
        '_env/gateway/.env.test',
      ],
      load: [configuration],
    }),
    // Rate limiting: 100 requests per minute per IP
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 second
        limit: 10, // 10 requests per second
      },
      {
        name: 'medium',
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
      {
        name: 'long',
        ttl: 3600000, // 1 hour
        limit: 1000, // 1000 requests per hour
      },
    ]),
    CoreModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserProxyMiddleware)
      .forRoutes(...UserService)
      .apply(WorkerProxyMiddleware)
      .forRoutes(...WorkerService)
      .apply(AdminProxyMiddleware)
      .forRoutes(...AdminService);
  }
}
