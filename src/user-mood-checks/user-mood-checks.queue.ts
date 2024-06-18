import { BullModule, BullModuleOptions, InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { defaultJobOptions } from '../core/configs/bull.config';

export const USER_MOOD_CHECKS_QUEUE = 'userMoodChecksQueue';

export const userMoodChecksQueueConfig: BullModuleOptions = {
  name: USER_MOOD_CHECKS_QUEUE,
  defaultJobOptions: defaultJobOptions,
};

export enum UserMoodChecksJob {
  SAVE_STREAK = '[USER MOOD CHECK] SAVE STREAK',
}

export const registerUserMoodChecksQueue = BullModule.registerQueue(
  userMoodChecksQueueConfig,
);

@Injectable()
export class UserMoodChecksQueue {
  constructor(
    @InjectQueue(USER_MOOD_CHECKS_QUEUE)
    private readonly userMoodChecksQueue: Queue,
  ) {}

  async saveUserMoodCheckStreak(userId: string, date: string): Promise<void> {
    await this.userMoodChecksQueue.add(UserMoodChecksJob.SAVE_STREAK, {
      userId,
      date,
    });
  }
}
