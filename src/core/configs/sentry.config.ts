import { ConfigService } from '@nestjs/config';
import {
  SentryModuleAsyncOptions,
  SentryModuleOptions,
} from '@travelerdev/nestjs-sentry';
import { Environment, EnvVariable } from './config';

export const sentryModuleOptions: SentryModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: async (config: ConfigService) => {
    const dsn = config.getOrThrow<string>(EnvVariable.SENTRY_DSN);
    const env = config.getOrThrow<string>(EnvVariable.NODE_ENV);
    const options: SentryModuleOptions = {
      dsn,
      environment: env,
      enabled: env !== Environment.DEVELOPMENT,
    };

    return options;
  },
};
