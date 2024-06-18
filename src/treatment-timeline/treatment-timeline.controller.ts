import { Body, Controller, Post } from '@nestjs/common';
import { TreatmentTimelineService } from './treatment-timeline.service';
import {
  DefaultTimelineMessageData,
  RemoveDelayedJobsByStageBody,
} from './dto/treatment-timeline.dto';
import { TreatmentTimelineMessageQueue } from './treatment-timeline-message.queue';

@Controller('treatment-timeline')
export class TreatmentTimelineController {
  constructor(
    private readonly treatmentTimelineService: TreatmentTimelineService,
    private readonly treatmentTimelineMessageQueue: TreatmentTimelineMessageQueue,
  ) {}

  @Post('/test-default-frequency')
  async addUserStreak(
    @Body() body: DefaultTimelineMessageData,
  ): Promise<string> {
    return await this.treatmentTimelineService.checkDefaultTreatmentTimelineMessage(
      body,
    );
  }

  @Post('/test-remove-delayed-jobs')
  async removeDelayedJobsByStageId(
    @Body() body: RemoveDelayedJobsByStageBody,
  ): Promise<string> {
    await this.treatmentTimelineMessageQueue.removeDelayedJobsByStageId(
      body.stageId,
    );
    return 'Jobs Removed';
  }
}
