import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { ProcessorLogger } from '@core/helpers/processor-logging.helper';
import { TreatmentTimelineService } from './treatment-timeline.service';
import { defaultWorkersConcurrency } from '@core/configs/bull.config';
import Bull from 'bull';
import { DefaultTimelineMessageData } from './dto/treatment-timeline.dto';
import {
  TREATMENT_TIMELINE_MESSAGE_QUEUE,
  TreatmentTimelineMessageJob,
} from './treatment-timeline-message.queue';
import { StageUpdatedEvent } from './treatment-timeline.event';

@Processor(TREATMENT_TIMELINE_MESSAGE_QUEUE)
export class TreatmentTimelineMessageProcessor extends ProcessorLogger {
  readonly logger = new Logger(TreatmentTimelineMessageProcessor.name);
  constructor(
    private readonly treatmentTimelineService: TreatmentTimelineService,
  ) {
    super();
  }

  @Process({
    name: TreatmentTimelineMessageJob.CHECK_DEFAULT_TREATMENT_TIMELINE_MESSAGE,
    concurrency: defaultWorkersConcurrency,
  })
  async handleCheckDefaultTreatmentTimelineMessageJob(
    job: Bull.Job<DefaultTimelineMessageData>,
  ): Promise<string> {
    try {
      const { data } = job;
      return await this.treatmentTimelineService.checkDefaultTreatmentTimelineMessage(
        data,
      );
    } catch (error) {
      this.logger.error(
        `${this.handleCheckDefaultTreatmentTimelineMessageJob.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: TreatmentTimelineMessageJob.ADD_DEFAULT_TREATMENT_TIMELINE_MESSAGE,
    concurrency: defaultWorkersConcurrency,
  })
  async handleAddDefaultTreatmentTimelineMessageJob(
    job: Bull.Job<DefaultTimelineMessageData>,
  ): Promise<string> {
    try {
      const { data } = job;
      return await this.treatmentTimelineService.addDefaultTreatmentTimelineMessages(
        data,
      );
    } catch (error) {
      this.logger.error(
        `${this.handleAddDefaultTreatmentTimelineMessageJob.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: TreatmentTimelineMessageJob.UPDATE_DEFAULT_TIMELINE_MESSAGE_JOBS,
    concurrency: defaultWorkersConcurrency,
  })
  async handleUpdateDefaultTimelineMessageJobsJob(
    job: Bull.Job<StageUpdatedEvent>,
  ): Promise<string> {
    try {
      const { data } = job;
      return await this.treatmentTimelineService.updatedDefaultStageMessagesJobs(
        data.updatedStage,
      );
    } catch (error) {
      this.logger.error(
        `${this.handleUpdateDefaultTimelineMessageJobsJob.name}:${error.stack}`,
      );
      throw error;
    }
  }
}
