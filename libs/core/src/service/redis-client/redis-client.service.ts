import { Inject, Injectable } from '@nestjs/common';
import { REDIS_CLIENT, RedisClient, RedisClientError } from '@shared/core';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: RedisClient) {}

  getClient(name?: string): Redis {
    if (!name) {
      name = this.redisClient.defaultKey;
    }
    if (!this.redisClient.clients.has(name)) {
      throw new RedisClientError(`client ${name} does not exist`);
    }
    return this.redisClient.clients.get(name)!;
  }

  getClients(): Map<string, Redis> {
    return this.redisClient.clients;
  }
}
