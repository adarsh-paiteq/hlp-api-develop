import { ConfigService } from '@nestjs/config';
import Axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import * as AxiosLogger from 'axios-logger';
import { Environment, EnvVariable } from '../configs/config';
import { GlobalLogConfig } from 'axios-logger/lib/common/types';
import { FactoryProvider, Logger } from '@nestjs/common';

export const Mailchimp = 'Mailchimp';

export type Mailchimp = AxiosInstance;

export const MailchimpProvider: FactoryProvider<AxiosInstance> = {
  provide: Mailchimp,
  inject: [ConfigService],
  useFactory(configService: ConfigService): AxiosInstance {
    const logger = new Logger(Mailchimp);
    const apiKey = configService.getOrThrow<string>(
      EnvVariable.MAILCHIMP_API_KEY,
    );
    const serverPrefix = configService.getOrThrow<string>(
      EnvVariable.MAILCHIMP_SERVER_PREFIX,
    );
    const authKey = Buffer.from(`user:${apiKey}`).toString('base64');

    const nodeEnv = configService.getOrThrow<Environment>(EnvVariable.NODE_ENV);
    const isLocal = nodeEnv === Environment.LOCAL;

    const api = Axios.create({
      baseURL: `https://${serverPrefix}.api.mailchimp.com/3.0`,
      headers: {
        Authorization: `Basic ${authKey}`,
      },
    });

    // axios logger config
    const logConfig: GlobalLogConfig = {
      headers: false,
      data: isLocal,
      prefixText: `${Mailchimp}`,
      logger: logger.log.bind(logger),
    };
    // https://github.com/hg-pyun/axios-logger/issues/124#issuecomment-1454993672
    api.interceptors.request.use(
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
    api.interceptors.response.use(
      (response) => {
        return AxiosLogger.responseLogger(response, logConfig);
      },
      (error) => {
        return AxiosLogger.errorLogger(error, logConfig);
      },
    );
    return api;
  },
};
