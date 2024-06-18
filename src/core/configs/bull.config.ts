import { BullModuleOptions, SharedBullAsyncConfiguration } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import Bull from 'bull';
import { EnvVariable } from './config';
import { EventEmitter } from 'events';

const keepJobOptions: Bull.KeepJobsOptions = {
  age: 604800, // 1 week
  count: 250,
};

export const defaultJobOptions: Bull.JobOptions = {
  backoff: { type: 'fixed', delay: 5000 },
  attempts: 5,
  removeOnComplete: keepJobOptions,
  removeOnFail: keepJobOptions,
};

export const bullQueueOptions: SharedBullAsyncConfiguration = {
  useFactory: async (configService: ConfigService) => {
    EventEmitter.defaultMaxListeners = 20;
    const port = configService.getOrThrow<number>(EnvVariable.REDIS_PORT);
    const host = configService.getOrThrow<string>(EnvVariable.REDIS_HOST);
    const password = configService.getOrThrow<string>(
      EnvVariable.REDIS_PASSWORD,
    );
    const options: BullModuleOptions = {
      redis: {
        password,
        port,
        host,
        username: 'default',
      },
      defaultJobOptions: defaultJobOptions,
    };
    // TODO: uncomment this when yogesh provides production deployment
    // const nodeEnv = process.env.NODE_ENV as string;
    // const isDev = nodeEnv && nodeEnv === 'development';
    // if (!isDev) {
    //   options.redis = { ...options.redis, tls: { servername: host } };
    // }
    return options;
  },
  inject: [ConfigService],
};

export const defaultWorkersConcurrency = 20;
