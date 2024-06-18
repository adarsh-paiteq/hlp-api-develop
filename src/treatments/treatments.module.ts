import { Module } from '@nestjs/common';
import { AuthModule } from '@shared/auth/auth.module';
import { TreatmentsResolver } from './treatments.resolver';
import { TreatmentsService } from './treatments.service';
import { TreatmentsRepo } from './treatments.repo';
import { TreatmentsController } from './treatments.controller';
import { EmailService } from '@shared/services/email/email.service';
import { TreatmentsEventListener } from './treatments.listener';
import { TreatmentsQueue, registerTreatmentsQueue } from './treatments.queue';
import { TreatmentsProcessor } from './treatments.processor';

@Module({
  imports: [AuthModule, registerTreatmentsQueue],
  providers: [
    TreatmentsResolver,
    TreatmentsService,
    TreatmentsRepo,
    EmailService,
    TreatmentsEventListener,
    TreatmentsQueue,
    TreatmentsProcessor,
  ],
  controllers: [TreatmentsController],
  exports: [TreatmentsService, registerTreatmentsQueue],
})
export class TreatmentsModule {}
