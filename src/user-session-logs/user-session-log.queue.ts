import { defaultJobOptions } from '@core/configs/bull.config';
import { BullModule, BullModuleOptions, InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { RobotPageType } from '../robots/entities/robot.entity';
export const USER_SESSION_LOG_QUEUE = 'userSessionLogs';
export const userSessionLogQueueConfig: BullModuleOptions = {
  name: USER_SESSION_LOG_QUEUE,
  defaultJobOptions: defaultJobOptions,
};
export enum UserSesssionLogJob {
  ADD_LOG = '[USER_SESSION_LOG] ADD LOG',
}

export const registerUserSessionLogQueue = BullModule.registerQueueAsync(
  userSessionLogQueueConfig,
);

@Injectable()
export class UserSessionLogQueue {
  constructor(
    @InjectQueue(USER_SESSION_LOG_QUEUE)
    private readonly logQueue: Queue,
  ) {}

  async addLog(
    userId: string,
    date: string,
    page?: RobotPageType,
  ): Promise<void> {
    await this.logQueue.add(UserSesssionLogJob.ADD_LOG, { userId, date, page });
  }
}
