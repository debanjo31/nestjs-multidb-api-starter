import { Redis } from 'ioredis';
import { Provider } from '@nestjs/common';
import { REDIS_CLIENT, REDIS_MODULE_OPTIONS } from '../../constants';
import { RedisModuleAsyncOptions, RedisModuleOptions, Utils } from '@shared/core';

export class RedisClientError extends Error {}

export interface RedisClient {
  defaultKey: string;
  clients: Map<string, Redis>;
  size: number;
}

async function getClient(options: RedisModuleOptions): Promise<Redis> {
  const { onClientReady, url, ...opt } = options;
  const client = url ? new Redis(url) : new Redis(opt);
  if (onClientReady) {
    onClientReady(client);
  }
  return client;
}

export const createClient = (): Provider => ({
  provide: REDIS_CLIENT,
  useFactory: async (options: RedisModuleOptions | RedisModuleOptions[]): Promise<RedisClient> => {
    const clients = new Map<string, Redis>();
    let defaultKey = Utils.generateUniqueId('_cacheKey');
    if (Array.isArray(options)) {
      const optionsArray = options as RedisModuleOptions[];
      await Promise.all(
        optionsArray.map(async (o) => {
          const key = o.name || defaultKey;
          if (clients.has(key)) {
            throw new RedisClientError(`${o.name || 'default'} client is exists`);
          }
          clients.set(key, await getClient(o));
        }),
      );
    } else {
      const singleOption = options as RedisModuleOptions;
      if (singleOption?.name && singleOption?.name?.length !== 0) {
        defaultKey = singleOption.name;
      }
      clients.set(defaultKey, await getClient(singleOption));
    }
    return {
      defaultKey,
      clients,
      size: clients.size,
    };
  },
  inject: [REDIS_MODULE_OPTIONS],
});

export const createAsyncClientOptions = (options: RedisModuleAsyncOptions): Provider => ({
  provide: REDIS_MODULE_OPTIONS,
  useFactory: options.useFactory!,
  inject: options.inject || [],
});
