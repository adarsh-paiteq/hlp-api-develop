import { Module } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { InvitationsResolver } from './invitations.resolver';
import { InvitationsRepo } from './invitations.repo';
import { AuthModule } from '@shared/auth/auth.module';
import { EmailsModule } from '../emails/emails.module';
import { FirebaseDynamicLinksService } from '@shared/services/firebase-dynamic-links/firebase-dynamic-links.service';
import { UtilsModule } from '@utils/utils.module';

@Module({
  imports: [AuthModule, EmailsModule, UtilsModule],
  providers: [
    InvitationsService,
    InvitationsResolver,
    InvitationsRepo,
    FirebaseDynamicLinksService,
  ],
})
export class InvitationsModule {}
