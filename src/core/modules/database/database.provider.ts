import { EnvVariable, Environment } from '@core/configs/config';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as pg from 'pg';

export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';

export type DatabaseConnection = pg.Client;

export const databaseProviders = [
  {
    provide: DATABASE_CONNECTION,
    inject: [ConfigService],
    useFactory: (configService: ConfigService): pg.Pool => {
      const env = configService.get<string>(EnvVariable.NODE_ENV);
      const isLocal = env === Environment.LOCAL;
      const logger = new Logger(DATABASE_CONNECTION);
      const url = configService.get(EnvVariable.POSTGRES_URL);
      const poolConfig: pg.PoolConfig = {
        connectionString: url,
        // max: 25,
        idleTimeoutMillis: 0,
        allowExitOnIdle: false,
      };
      if (!isLocal) {
        poolConfig.ssl = {
          rejectUnauthorized: false,
        };
      }
      const client = new pg.Pool(poolConfig);
      client.on('error', (error) => {
        logger.error(error.message);
      });
      return client;
    },
  },
];
