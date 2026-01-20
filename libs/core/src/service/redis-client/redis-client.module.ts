import { DynamicModule, Module } from '@nestjs/common';
import { RedisModuleAsyncOptions, RedisModuleOptions } from '@shared/core/shared';
import { RedisCoreModule } from './redis-client-core.module';

@Module({})
export class RedisModule {
  static register(options: RedisModuleOptions | RedisModuleOptions[]): DynamicModule {
    return {
      module: RedisModule,
      imports: [RedisCoreModule.register(options)],
    };
  }

  static forRootAsync(options: RedisModuleAsyncOptions): DynamicModule {
    return {
      module: RedisModule,
      imports: [RedisCoreModule.forRootAsync(options)],
    };
  }
}
