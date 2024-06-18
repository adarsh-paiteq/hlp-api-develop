import { FactoryProvider, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvVariable, Environment } from '@core/configs/config';
import axios, {
  AxiosInstance,
  CreateAxiosDefaults,
  InternalAxiosRequestConfig,
} from 'axios';
import https from 'https';
import { GlobalLogConfig } from 'axios-logger/lib/common/types';
import * as AxiosLogger from 'axios-logger';

export const PSYQ_CLIENT = 'PSYQ_CLIENT';

export const PsyqClient: FactoryProvider<AxiosInstance> = {
  provide: PSYQ_CLIENT,
  inject: [ConfigService],
  useFactory(configService: ConfigService) {
    const logger = new Logger(PSYQ_CLIENT);

    const getHttpsAgent = function (): https.Agent {
      const encodedKey = configService.getOrThrow<string>(EnvVariable.PSYQ_KEY);
      const encodedCert = configService.getOrThrow<string>(
        EnvVariable.PSYQ_CERT,
      );
      const encodedCacert = configService.getOrThrow<string>(
        EnvVariable.PSYQ_CACERT,
      );

      const key = Buffer.from(encodedKey, 'base64');
      const cert = Buffer.from(encodedCert, 'base64');
      const ca = Buffer.from(encodedCacert, 'base64');

      const httpsAgent = new https.Agent({
        key: key,
        cert: cert,
        ca: ca,
      });

      return httpsAgent;
    };

    const env = configService.getOrThrow<Environment>(EnvVariable.NODE_ENV);
    const baseURL = configService.getOrThrow<string>(EnvVariable.PSYQ_URL);

    const axiosConfig: CreateAxiosDefaults = {
      baseURL: baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const isProd = env !== Environment.LOCAL && env !== Environment.DEVELOPMENT;

    if (isProd) {
      axiosConfig.httpsAgent = getHttpsAgent();
    }

    const client = axios.create(axiosConfig);

    // axios logger config
    const logConfig: GlobalLogConfig = {
      headers: false,
      data: true,
      prefixText: `${PSYQ_CLIENT}`,
      logger: logger.log.bind(logger),
    };
    // https://github.com/hg-pyun/axios-logger/issues/124#issuecomment-1454993672
    client.interceptors.request.use(
      (internalrequest: InternalAxiosRequestConfig) => {
        const headers = internalrequest.headers;
        const request: InternalAxiosRequestConfig = {
          ...internalrequest,
        };
        const logrequest = AxiosLogger.requestLogger(request, logConfig);
        internalrequest = {
          ...logrequest,
          ...{ headers: headers },
        };
        return internalrequest;
      },
      (error) => {
        return AxiosLogger.errorLogger(error, logConfig);
      },
    );
    client.interceptors.response.use(
      (response) => {
        return AxiosLogger.responseLogger(response, logConfig);
      },
      (error) => {
        return AxiosLogger.errorLogger(error, logConfig);
      },
    );
    return client;
  },
};
