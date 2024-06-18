import { BullModule, BullModuleOptions, InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { defaultJobOptions } from '@core/configs/bull.config';
import { Queue } from 'bull';
import { Users } from '../users/users.model';

export const PUK_QUEUE = 'puk';

export const pukQueueConfig: BullModuleOptions = {
  name: PUK_QUEUE,
  defaultJobOptions: defaultJobOptions,
};

export const registerPukQueue = BullModule.registerQueueAsync(pukQueueConfig);

export enum PukJob {
  CONFIRM_REGISTRATION = '[PUK] CONFIRM_REGISTRATION ',
  LOG_ACTIVITY = '[PUK] LOG ACTIVITY',
}

@Injectable()
export class PukQueue {
  constructor(
    @InjectQueue(PUK_QUEUE)
    private readonly pukQueue: Queue,
  ) {}

  async LogActivity(user: Users): Promise<void> {
    await this.pukQueue.add(PukJob.LOG_ACTIVITY, user);
  }

  async confirmRegistration(user: Users): Promise<void> {
    await this.pukQueue.add(PukJob.CONFIRM_REGISTRATION, user);
  }
}
