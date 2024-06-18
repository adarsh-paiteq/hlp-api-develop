import { defaultJobOptions } from '@core/configs/bull.config';
import { BullModule, BullModuleOptions, InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { UserSignedUpEvent } from '@users/user.event';
import { Queue } from 'bull';

export const TREATMENTS_QUEUE = 'treatments';

export const TreatmentsQueueConfig: BullModuleOptions = {
  name: TREATMENTS_QUEUE,
  defaultJobOptions: defaultJobOptions,
};

export const registerTreatmentsQueue = BullModule.registerQueueAsync(
  TreatmentsQueueConfig,
);

export enum treatmentsJob {
  CREATE_SIGNED_UP_USER_TREATMENT = '[TREATMENTS] CREATE SIGNED-UP USER TREATMENT',
}

@Injectable()
export class TreatmentsQueue {
  private logger = new Logger('[QUEUE]');
  constructor(
    @InjectQueue(TREATMENTS_QUEUE) private readonly treatmentsQueue: Queue,
  ) {}

  async addCreateSignedUpUserTreatmentJob(
    payload: UserSignedUpEvent,
  ): Promise<void> {
    await this.treatmentsQueue.add(
      treatmentsJob.CREATE_SIGNED_UP_USER_TREATMENT,
      payload,
    );
  }
}
