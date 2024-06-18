import { Module } from '@nestjs/common';
import { DigidService } from './digid.service';
import { DigidController } from './digid.controller';
import { DigidRepo } from './digid.repo';
import { DigidClient } from './digid.provider';
import { FirebaseDynamicLinksService } from '@shared/services/firebase-dynamic-links/firebase-dynamic-links.service';
import { DigidResolver } from './digid.resolver';
import { AuthModule } from '@shared/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [DigidController],
  providers: [
    DigidService,
    DigidRepo,
    DigidClient,
    FirebaseDynamicLinksService,
    DigidResolver,
  ],
})
export class DigidModule {}
