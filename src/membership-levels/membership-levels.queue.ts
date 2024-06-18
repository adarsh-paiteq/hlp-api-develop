import { defaultJobOptions } from '@core/configs/bull.config';
import { BullModule, BullModuleOptions, InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';

import { Queue } from 'bull';
import { PointsAddedEvent } from '../users/user.event';
export const MEMBERSHIP_LEVEL_QUEUE = 'membershiplevels';
const membershipLevelsQueueConfig: BullModuleOptions = {
  name: MEMBERSHIP_LEVEL_QUEUE,
  defaultJobOptions: defaultJobOptions,
};
export enum membershipLevelsJob {
  CHECK_MEMBERSHIP_LEVEL = '[LEVELS] CHECK_MEMBERSHIP_LEVEL',
}

export const registerMembershipLevelsQueue = BullModule.registerQueueAsync(
  membershipLevelsQueueConfig,
);
@Injectable()
export class MembershipLevelsQueue {
  constructor(
    @InjectQueue(MEMBERSHIP_LEVEL_QUEUE)
    private readonly membershipLevelsQueue: Queue,
  ) {}

  async checkMembershipLevel(payload: PointsAddedEvent): Promise<void> {
    await this.membershipLevelsQueue.add(
      membershipLevelsJob.CHECK_MEMBERSHIP_LEVEL,
      payload,
    );
  }
}
