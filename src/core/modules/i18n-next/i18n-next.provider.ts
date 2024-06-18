import { FactoryProvider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as i18next from 'i18next';
import FsBackend, { FsBackendOptions } from 'i18next-fs-backend';
import * as middleware from 'i18next-http-middleware';
import path from 'path';
import { EnvVariable, Environment } from '../../configs/config';

export * from 'i18next';
export const I18N = 'I18N';
export const i18nNextProvider: FactoryProvider = {
  provide: I18N,
  inject: [ConfigService],
  async useFactory(configService: ConfigService): Promise<i18next.i18n> {
    const fallbackLng = configService.getOrThrow<string>(
      EnvVariable.I18N_FALLBACK_LANG,
    );
    const nodeEnv = configService.getOrThrow<Environment>(EnvVariable.NODE_ENV);
    const isLocal = nodeEnv === Environment.LOCAL;
    const basePath = path.join(__dirname, '../../../../i18n/{{lng}}');
    const loadPath = `${basePath}/{{lng}}_{{ns}}.json`;
    const addPath = `${basePath}/{{lng}}_{{ns}}.missing.json`;
    const instance = i18next.createInstance();
    await instance
      .use(middleware.LanguageDetector)
      .use(FsBackend)
      .init<FsBackendOptions>({
        debug: isLocal,
        lowerCaseLng: true,
        cleanCode: true,
        initImmediate: true,
        preload: ['nl'],
        ns: [
          'error',
          'validation',
          'success',
          'email',
          'constant',
          'notification',
        ],
        defaultNS: 'validation',
        fallbackNS: [
          'error',
          'validation',
          'success',
          'email',
          'constant',
          'notification',
        ],
        fallbackLng,
        backend: {
          loadPath,
          addPath,
        },
      });
    return instance;
  },
};
