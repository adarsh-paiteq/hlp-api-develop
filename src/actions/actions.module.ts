import { Module } from '@nestjs/common';
import { ActionsService } from './actions.service';
import { ActionsController } from './actions.controller';
import { ActionsRepo } from './actions.repo';
import { HasuraService } from '../shared/services/hasura/hasura.service';
import { AuthModule } from '../shared/auth/auth.module';

import { EmailService } from '../shared/services/email/email.service';
import { EmailsModule } from '../emails/emails.module';
import { ActionsResolver } from './actions.resolver';

@Module({
  controllers: [ActionsController],
  providers: [
    ActionsService,
    ActionsRepo,
    ActionsResolver,
    HasuraService,
    EmailService,
  ],
  imports: [AuthModule, EmailsModule],
})
export class ActionsModule {}
