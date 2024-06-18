import { defaultJobOptions } from '@core/configs/bull.config';
import { BullModule, BullModuleOptions, InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { ScheduleSessionAddedEvent } from '../schedule-sessions/schedule-sessions.event';

export const CHECKINS_QUEUE = 'checkins';
export const checkinsQueueConfig: BullModuleOptions = {
  name: CHECKINS_QUEUE,
  defaultJobOptions: defaultJobOptions,
};

export enum checkinsJob {
  CHECK_CHECKIN_LEVEL = '[CHECKIN] CHECK_CHECKIN_LEVEL',
}

export const registerCheckinsQueue =
  BullModule.registerQueueAsync(checkinsQueueConfig);

@Injectable()
export class CheckinsQueue {
  constructor(
    @InjectQueue(CHECKINS_QUEUE)
    private readonly checkinsQueue: Queue,
  ) {}

  async checkCheeckinLevel(payload: ScheduleSessionAddedEvent): Promise<void> {
    await this.checkinsQueue.add(checkinsJob.CHECK_CHECKIN_LEVEL, payload);
  }
}
