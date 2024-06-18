import { Module } from '@nestjs/common';
import { AuthModule } from '@shared/auth/auth.module';
import { EmailService } from '@shared/services/email/email.service';
import { FirebaseDynamicLinksService } from '@shared/services/firebase-dynamic-links/firebase-dynamic-links.service';
import { TemplateService } from '@shared/services/template/template.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { EmailsContent } from './emails.content';
import { emailsController } from './emails.controller';
import { EmailsListener } from './emails.listener';
import { EmailsProcessor } from './emails.processor';
import { EmailsQueue, registerEmailsQueue } from './emails.queue';
import { EmailsRepo } from './emails.repo';
import { EmailsService } from './emails.service';
import { UtilsModule } from '../utils/utils.module';
import { TreatmentsModule } from '@treatments/treatments.module';

@Module({
  imports: [
    registerEmailsQueue,
    AuthModule,
    NotificationsModule,
    UtilsModule,
    TreatmentsModule,
  ],
  providers: [
    EmailsContent,
    EmailsService,
    TemplateService,
    EmailService,
    EmailsQueue,
    EmailsProcessor,
    EmailsListener,
    EmailsRepo,
    FirebaseDynamicLinksService,
  ],
  exports: [EmailsService, registerEmailsQueue],
  controllers: [emailsController],
})
export class EmailsModule {}
