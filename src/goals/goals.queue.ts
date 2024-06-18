import { defaultJobOptions } from '@core/configs/bull.config';
import { BullModule, BullModuleOptions, InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { CheckGoalLevel } from './goals.dto';
export const GOALS_QUEUE = 'goals';

export const goalsQueueConfig: BullModuleOptions = {
  name: GOALS_QUEUE,
  defaultJobOptions: defaultJobOptions,
};

export enum GoalsJob {
  CHECK_GOAL_LEVEL = '[GOALS] CHECK_GOAL_LEVEL',
  ADDED_USER_GOAL = '[GOALS] ADDED_USER_GOAL',
}
export const registerGoalsQueue =
  BullModule.registerQueueAsync(goalsQueueConfig);

@Injectable()
export class GoalsQueue {
  constructor(
    @InjectQueue(GOALS_QUEUE)
    private readonly goalsQueue: Queue,
  ) {}

  async checkGoalLevelQueue(checkGoalLevel: CheckGoalLevel): Promise<unknown> {
    return this.goalsQueue.add(GoalsJob.CHECK_GOAL_LEVEL, checkGoalLevel);
  }

  async addUserGoal(userId: string): Promise<void> {
    await this.goalsQueue.add(GoalsJob.ADDED_USER_GOAL, { userId });
  }
}
