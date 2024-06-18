import { defaultJobOptions } from '@core/configs/bull.config';
import { BullModule, BullModuleOptions, InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { JobOptions, Queue } from 'bull';
import {
  DefaultTimelineMessageEvent,
  StageUpdatedEvent,
} from './treatment-timeline.event';
import { v4 as uuidv4 } from 'uuid';
import { DefaultTimelineMessageData } from './dto/treatment-timeline.dto';

export const TREATMENT_TIMELINE_MESSAGE_QUEUE = 'treatmentTimelineMessage';
export const treatmentTimelineMessageQueueConfig: BullModuleOptions = {
  name: TREATMENT_TIMELINE_MESSAGE_QUEUE,
  defaultJobOptions: defaultJobOptions,
};

export const registerTreatmentTimelineMessageQueue =
  BullModule.registerQueueAsync(treatmentTimelineMessageQueueConfig);

export enum TreatmentTimelineMessageJob {
  ADD_DEFAULT_TREATMENT_TIMELINE_MESSAGE = '[TREATMENT_TIMELINE_MESSAGE] ADD_DEFAULT_TREATMENT_TIMELINE_MESSAGE',
  CHECK_DEFAULT_TREATMENT_TIMELINE_MESSAGE = '[TREATMENT_TIMELINE_MESSAGE] CHECK_DEFAULT_TREATMENT_TIMELINE_MESSAGE',
  UPDATE_DEFAULT_TIMELINE_MESSAGE_JOBS = '[TREATMENT_TIMELINE] UPDATE_DEFAULT_TIMELINE_MESSAGE_JOBS',
}

@Injectable()
export class TreatmentTimelineMessageQueue {
  private logger = new Logger(TreatmentTimelineMessageQueue.name);
  constructor(
    @InjectQueue(TREATMENT_TIMELINE_MESSAGE_QUEUE)
    private readonly treatmentTimelineMessageQueue: Queue,
  ) {}

  async addCheckDefaultTimelineMessageJob(
    payload: DefaultTimelineMessageData,
  ): Promise<void> {
    this.logger.log(
      `Adding job To check stage messages ${payload.stageType}:${payload.frequency}`,
    );
    await this.treatmentTimelineMessageQueue.add(
      TreatmentTimelineMessageJob.CHECK_DEFAULT_TREATMENT_TIMELINE_MESSAGE,
      payload,
    );
  }

  async addDefaultTimelineMessageJob(
    payload: DefaultTimelineMessageEvent,
  ): Promise<void> {
    const { delay, data } = payload;
    const opts: JobOptions = {
      delay,
      jobId: `${data.stageId}:${data.treatmentId}:${data.userId}:${uuidv4()}`,
    };

    this.logger.log(
      `Adding job to add ${data.stageType}:${data.frequency} timeline message`,
    );

    await this.treatmentTimelineMessageQueue.add(
      TreatmentTimelineMessageJob.ADD_DEFAULT_TREATMENT_TIMELINE_MESSAGE,
      data,
      opts,
    );
  }

  async removeDelayedJobsByStageId(stageId: string): Promise<void> {
    const pattern = `${stageId}:*:*:*`; // Wildcards for treatmentId and userId
    await this.treatmentTimelineMessageQueue.removeJobs(pattern);
  }

  async addUpdateDefaultTimelineMessageJobsJob(
    payload: StageUpdatedEvent,
  ): Promise<void> {
    this.logger.log(`Adding job To update stage messages delayed jobs`);

    const opts: JobOptions = {
      delay: 1800000, // 30 minutes
    };
    await this.treatmentTimelineMessageQueue.add(
      TreatmentTimelineMessageJob.UPDATE_DEFAULT_TIMELINE_MESSAGE_JOBS,
      payload,
      opts,
    );
  }
}
