import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  HLPPointsDonatedEvent,
  PointsAddedEvent,
  UserEvent,
} from '../users/user.event';
import { MembershipStagesQueue } from './membership-stages.queue';

@Injectable()
export class MembershipStagesListener {
  private readonly logger = new Logger(MembershipStagesListener.name);
  constructor(private readonly membershipStagesQueue: MembershipStagesQueue) {}

  @OnEvent(UserEvent.POINTS_ADDED)
  async handlePointsAddEvent(payload: PointsAddedEvent): Promise<void> {
    await this.membershipStagesQueue.checkMembershipStage(payload);
  }

  @OnEvent(UserEvent.HLP_POINTS_DONATED)
  async handleHLPPointsDonatedEvent(
    payload: HLPPointsDonatedEvent,
  ): Promise<void> {
    this.logger.log(`HLP points donated checking membership stage`);
    await this.membershipStagesQueue.HandleHlpDonated(payload);
  }
}
