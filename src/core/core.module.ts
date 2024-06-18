import { BullModule } from '@nestjs/bull';
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GraphQLModule } from '@nestjs/graphql';
import { ClsModule } from 'nestjs-cls';
import { DatabaseModule } from './modules/database/database.module';
import { AllExceptionsFilter } from '../shared/filters/all.filter';
import { bullQueueOptions } from './configs/bull.config';
import { configOptions } from './configs/config';
import { graphqlConfig } from './configs/graphql.config';
import { RedisModule } from './modules/redis/redis.module';
import { redisModuleOptions } from './configs/redis.config';
import { LoggingPlugin } from './plugins/logging.plugin';
import { SentryModule } from '@travelerdev/nestjs-sentry';
import { sentryModuleOptions } from './configs/sentry.config';
import { ErrorReportService } from './services/error-report/error-report.service';
import { TranslationService } from '@shared/services/translation/translation.service';
import { I18nNextModule } from './modules/i18n-next';
import { AuthService } from '@shared/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { OneSignalService } from '@shared/services/one-signal/one-signal';
import { MailchimpProvider } from './providers/mailchimp.provider';
import { MailchimpService } from '@shared/services/mailchimp/mailchimp.service';
import { BranchIOProvider } from './providers/branch-io.provider';
import { BranchIOService } from '@shared/services/branch-io/branch-io.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot(configOptions),
    DatabaseModule,
    RedisModule.registerAsync(redisModuleOptions),
    BullModule.forRootAsync(bullQueueOptions),
    GraphQLModule.forRootAsync(graphqlConfig),
    EventEmitterModule.forRoot(),
    // ThrottlerModule.forRootAsync(throttlerOptions),
    SentryModule.forRootAsync(sentryModuleOptions),
    ClsModule.forRoot({
      global: true,
      middleware: { generateId: true },
    }),
    I18nNextModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    LoggingPlugin,
    // {
    //   provide: APP_GUARD,
    //   useClass: GqlThrottlerGuard,
    // },
    ErrorReportService,
    TranslationService,
    AuthService,
    JwtService,
    OneSignalService,
    MailchimpProvider,
    MailchimpService,
    BranchIOProvider,
    BranchIOService,
  ],
  exports: [
    DatabaseModule,
    RedisModule,
    ErrorReportService,
    TranslationService,
    MailchimpService,
    BranchIOService,
  ],
})
export class CoreModule {}
