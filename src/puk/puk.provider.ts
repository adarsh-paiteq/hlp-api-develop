import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import * as AxiosLogger from 'axios-logger';
import * as jwt from 'jsonwebtoken';
import { Environment, EnvVariable } from '../core/configs/config';

export const PUK_API = 'PUK_API';

export const PUKProvider = {
  provide: PUK_API,
  useFactory(configService: ConfigService): AxiosInstance {
    const encodeKey = configService.getOrThrow<string>(EnvVariable.PUK_KEY);
    const uri = configService.getOrThrow<string>(EnvVariable.PUK_API_URL);
    const nodeEnv = configService.getOrThrow<string>(EnvVariable.NODE_ENV);
    const isDev = nodeEnv === Environment.DEVELOPMENT;
    const key = Buffer.from(encodeKey, 'base64').toString();

    const client = axios.create({
      baseURL: uri,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });

    // auth
    const payload = {
      issuedAt: Date.now(),
    };
    const token = jwt.sign(payload, key, { algorithm: 'RS512' });
    AxiosLogger.setGlobalConfig({ data: isDev });
    client.interceptors.request.use((config) => {
      if (config.headers) {
        config.headers['x-bifrost-hlp'] = token;
      }
      return AxiosLogger.requestLogger(config);
    }, AxiosLogger.errorLogger);
    client.interceptors.response.use(
      AxiosLogger.responseLogger,
      AxiosLogger.errorLogger,
    );
    return client;
  },
  inject: [ConfigService],
};
