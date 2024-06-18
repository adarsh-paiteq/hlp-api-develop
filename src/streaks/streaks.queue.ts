import { defaultJobOptions } from '@core/configs/bull.config';
import { BullModule, BullModuleOptions, InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import Bull, { Queue } from 'bull';
import { ScheduleSessionDto } from '../schedule-sessions/schedule-sessions.dto';
export const STREAKS_QUEUE = 'streaks';
export const streaksQueueConfig: BullModuleOptions = {
  name: STREAKS_QUEUE,
  defaultJobOptions: defaultJobOptions,
};
export enum StreakJob {
  ADD_STREAK = 'ADD STREAK',
}

export const registerStreaksQueue =
  BullModule.registerQueueAsync(streaksQueueConfig);

@Injectable()
export class StreaksQueue {
  constructor(
    @InjectQueue(STREAKS_QUEUE) private readonly streaksQueue: Queue,
  ) {}

  async addStreak(
    scheduleSession: ScheduleSessionDto,
  ): Promise<Bull.Job<ScheduleSessionDto>> {
    return this.streaksQueue.add(StreakJob.ADD_STREAK, scheduleSession);
  }
}
