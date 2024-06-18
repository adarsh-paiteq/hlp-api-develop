import { Module } from '@nestjs/common';
import { AuthModule } from '@shared/auth/auth.module';
import { TreatmentTimelineResolver } from './treatment-timeline.resolver';
import { TreatmentTimelineService } from './treatment-timeline.service';
import { TreatmentTimelineRepo } from './treatment-timeline.repo';
import { TreatmentTimelineProcessor } from './treatment-timeline.processor';
import { TreatmentTimelineEventListener } from './treatment-timeline.listener';
import {
  TreatmentTimelineQueue,
  registerTreatmentTimelineQueue,
} from './treatment-timeline.queue';
import { SchedulesModule } from '@schedules/schedules.module';
import { TreatmentTimelineController } from './treatment-timeline.controller';
import {
  TreatmentTimelineMessageQueue,
  registerTreatmentTimelineMessageQueue,
} from './treatment-timeline-message.queue';
import { TreatmentTimelineMessageProcessor } from './treatment-timeline-message.processor';
import { UtilsModule } from '@utils/utils.module';

@Module({
  imports: [
    AuthModule,
    registerTreatmentTimelineQueue,
    registerTreatmentTimelineMessageQueue,
    SchedulesModule,
    UtilsModule,
  ],
  providers: [
    TreatmentTimelineResolver,
    TreatmentTimelineService,
    TreatmentTimelineRepo,
    TreatmentTimelineProcessor,
    TreatmentTimelineEventListener,
    TreatmentTimelineQueue,
    TreatmentTimelineMessageQueue,
    TreatmentTimelineMessageProcessor,
  ],
  controllers: [TreatmentTimelineController],
  exports: [
    registerTreatmentTimelineQueue,
    registerTreatmentTimelineMessageQueue,
  ],
})
export class TreatmentTimelineModule {}
