import { Module } from '@nestjs/common';
import { AuthModule } from '@shared/auth/auth.module';
import { DoctorsResolver } from './doctors.resolver';
import { DoctorsService } from './doctors.service';
import { DoctorsRepo } from './doctors.repo';
import { EmailsModule } from '../emails/emails.module';
import { EmailService } from '@shared/services/email/email.service';
import { FirebaseDynamicLinksService } from '@shared/services/firebase-dynamic-links/firebase-dynamic-links.service';
import { UtilsModule } from '../utils/utils.module';
import { PsyqModule } from '@psyq/psyq.module';

@Module({
  imports: [AuthModule, PsyqModule, EmailsModule, UtilsModule],
  providers: [
    DoctorsResolver,
    DoctorsService,
    DoctorsRepo,
    EmailService,
    FirebaseDynamicLinksService,
  ],
})
export class DoctorsModule {}
