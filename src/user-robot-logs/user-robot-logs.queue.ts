import { defaultJobOptions } from '@core/configs/bull.config';
import { BullModule, BullModuleOptions, InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { UserRobotLogDto } from './dto/user-robot-log.dto';
export const USER_ROBOT_LOG_QUEUE = 'userRobotLogs';
export const userRobotLogQueueConfig: BullModuleOptions = {
  name: USER_ROBOT_LOG_QUEUE,
  defaultJobOptions: defaultJobOptions,
};
export enum UserRobotLogJob {
  ADD_LOG = '[USER_ROBOT_LOG] ADD LOG',
}

export const registerUserRobotLogQueue = BullModule.registerQueueAsync(
  userRobotLogQueueConfig,
);

@Injectable()
export class UserRobotLogQueue {
  constructor(
    @InjectQueue(USER_ROBOT_LOG_QUEUE)
    private readonly logQueue: Queue,
  ) {}

  async addLog(log: UserRobotLogDto): Promise<void> {
    await this.logQueue.add(UserRobotLogJob.ADD_LOG, log);
  }
}
