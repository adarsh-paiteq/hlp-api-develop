import { Logger } from '@nestjs/common';
import Redis, { RedisOptions } from 'ioredis';
import { MODULE_OPTIONS_TOKEN } from './redis.module-definition';

export const REDIS = 'REDIS';

export const RedisProvider = {
  provide: REDIS,
  useFactory: (options: RedisOptions): Redis => {
    const logger = new Logger(REDIS);
    const client = new Redis(options);
    client.on('connect', () => {
      logger.log(`connected to redis`);
    });
    client.on('error', (error) => {
      logger.error(error);
    });
    return client;
  },

  inject: [MODULE_OPTIONS_TOKEN],
};
