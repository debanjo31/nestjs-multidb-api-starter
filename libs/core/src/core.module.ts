import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import {
  FileUploadService,
  JobService,
  RedisModule,
  WORKER_PROVIDERS,
  WorkService,
} from '@shared/core';
import * as _ from 'lodash';

@Global()
@Module({
  imports: [
    HttpModule,
    MongooseModule.forRootAsync({
      useFactory: (config: ConfigService) => {
        return {
          uri: config.get('app.mongodb.url'),
          useNewUrlParser: true,
          useUnifiedTopology: true,
        };
      },
      inject: [ConfigService],
    }),
    // RedisModule.forRootAsync({
    //   useFactory: (configService: ConfigService) => configService.get('app.redis'),
    //   inject: [ConfigService],
    // }),
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => {
        const dbDefaultType = config.get('app.rdbms.default');
        const dbConfig = config.get('app.rdbms');
        const isProduction = config.get('app.environment') === 'production';
        const sslEnabled = dbConfig[dbDefaultType].ssl;

        const migrationsDir = !_.isUndefined(
          dbConfig[dbDefaultType].migrationsDir,
        )
          ? path.join(__dirname, dbConfig[dbDefaultType].migrationsDir)
          : path.join(__dirname, '..', 'migrations');

        const migrationsPath = path.join(migrationsDir, '**{.ts,.js');
        return {
          type: dbDefaultType,
          host: dbConfig[dbDefaultType].host,
          port: dbConfig[dbDefaultType].port,
          username: dbConfig[dbDefaultType].username,
          password: dbConfig[dbDefaultType].password,
          database: dbConfig[dbDefaultType].name,
          entities: [],
          autoLoadEntities: true,
          synchronize: true,
          keepConnectionAlive: false,
          migrations: [migrationsPath],
          // SSL: Only enable when configured, validate certs in production
          ssl: {
            rejectUnauthorized: false,
          },
          cli: {
            migrationsDir: 'src/migrations',
          },
          extra: {
            connectionLimit: 15,
          },
          logging: isProduction ? ['error', 'migration', 'warn'] : false,
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [...WORKER_PROVIDERS, FileUploadService, WorkService, JobService],
  exports: [...WORKER_PROVIDERS, FileUploadService, WorkService, JobService],
})
export class CoreModule {}
