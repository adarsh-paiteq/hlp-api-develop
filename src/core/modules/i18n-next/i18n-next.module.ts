import { Inject, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { I18N, i18nNextProvider } from './i18n-next.provider';
import { i18n } from 'i18next';
import * as middleware from 'i18next-http-middleware';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { I18nNextInterceptor } from './i18n-next.interceptor';

@Module({
  providers: [
    i18nNextProvider,
    {
      provide: APP_INTERCEPTOR,
      useClass: I18nNextInterceptor,
    },
  ],
  exports: [i18nNextProvider],
})
export class I18nNextModule implements NestModule {
  constructor(@Inject(I18N) private readonly i18nNext: i18n) {}
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(middleware.handle(this.i18nNext)).forRoutes('*');
  }
}
