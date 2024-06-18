import { ConfigurableModuleAsyncOptions } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisOptions } from 'ioredis';
import { EnvVariable } from './config';

export const redisModuleOptions: ConfigurableModuleAsyncOptions<RedisOptions> =
  {
    useFactory(configService: ConfigService) {
      const port = configService.getOrThrow(EnvVariable.REDIS_PORT);
      const host = configService.getOrThrow(EnvVariable.REDIS_HOST);
      const password = configService.getOrThrow(EnvVariable.REDIS_PASSWORD);
      return {
        password,
        port,
        host,
      };
    },
    inject: [ConfigService],
  };
