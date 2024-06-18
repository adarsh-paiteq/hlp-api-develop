import { defaultJobOptions } from '@core/configs/bull.config';
import { BullModule, BullModuleOptions, InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';

import { Queue } from 'bull';
import { HLPPointsDonatedEvent, PointsAddedEvent } from '../users/user.event';
export const MEMBERSHIP_STAGE_QUEUE = 'membershipstages';
export const membershipStagesQueueConfig: BullModuleOptions = {
  name: MEMBERSHIP_STAGE_QUEUE,
  defaultJobOptions: defaultJobOptions,
};
export enum membershipStagesJob {
  CHECK_MEMBERSHIP_STAGE = '[STAGES] CHECK_MEMBERSHIP_STAGE',
  CHECK_MEMBERSHIP_STAGE_HLP_DONATED = '[STAGES] CHECK_MEMBERSHIP_STAGE_HLP_DONATED',
}

export const registerMembershipStagesQueue = BullModule.registerQueueAsync(
  membershipStagesQueueConfig,
);

@Injectable()
export class MembershipStagesQueue {
  constructor(
    @InjectQueue(MEMBERSHIP_STAGE_QUEUE)
    private readonly membershipStagesQueue: Queue,
  ) {}

  async checkMembershipStage(payload: PointsAddedEvent): Promise<void> {
    await this.membershipStagesQueue.add(
      membershipStagesJob.CHECK_MEMBERSHIP_STAGE,
      payload,
    );
  }

  async HandleHlpDonated(payload: HLPPointsDonatedEvent): Promise<void> {
    await this.membershipStagesQueue.add(
      membershipStagesJob.CHECK_MEMBERSHIP_STAGE_HLP_DONATED,
      payload,
    );
  }
}
