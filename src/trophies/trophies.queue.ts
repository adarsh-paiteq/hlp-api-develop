import { defaultJobOptions } from '@core/configs/bull.config';
import { BullModule, BullModuleOptions, InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import Bull, { Queue } from 'bull';
import { CheckTrophies } from './trophies.dto';
export const TROPHIES_QUEUE = 'trophies';
export const trophiesQueueConfig: BullModuleOptions = {
  name: TROPHIES_QUEUE,
  defaultJobOptions: defaultJobOptions,
};

export enum TrophiesJob {
  CHECK_TROPHIES = 'CHECK TROPHIES',
}

export const registerTrophiesQueue =
  BullModule.registerQueueAsync(trophiesQueueConfig);
@Injectable()
export class TrophiesQueue {
  constructor(
    @InjectQueue(TROPHIES_QUEUE) private readonly trophiesQueue: Queue,
  ) {}

  async checkTrophiesAchieved(
    checkTrophiesData: CheckTrophies,
  ): Promise<Bull.Job<CheckTrophies>> {
    return this.trophiesQueue.add(
      TrophiesJob.CHECK_TROPHIES,
      checkTrophiesData,
    );
  }
}
