import { FactoryProvider, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import * as AxiosLogger from 'axios-logger';
import { Environment, EnvVariable } from '../configs/config';
import { GlobalLogConfig } from 'axios-logger/lib/common/types';

export const BRANCH_IO = 'BRANCHIO';

export type BranchIO = AxiosInstance;

export const BranchIOProvider: FactoryProvider<AxiosInstance> = {
  provide: BRANCH_IO,
  inject: [ConfigService],
  useFactory(configService: ConfigService): AxiosInstance {
    const logger = new Logger(BRANCH_IO);
    const baseURL = configService.getOrThrow<string>(
      EnvVariable.BRANCH_IO_API_URL,
    );
    const nodeEnv = configService.getOrThrow<Environment>(EnvVariable.NODE_ENV);
    const isLocal = nodeEnv === Environment.LOCAL;
    const api = Axios.create({
      baseURL,
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
      },
    });

    // axios logger config
    const logConfig: GlobalLogConfig = {
      headers: false,
      data: isLocal,
      prefixText: `${BRANCH_IO}`,
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
