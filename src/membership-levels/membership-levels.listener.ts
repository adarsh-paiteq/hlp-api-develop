import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PointsAddedEvent, UserEvent } from '../users/user.event';
import { MembershipLevelsQueue } from './membership-levels.queue';

@Injectable()
export class MembershipLevelsListener {
  constructor(private readonly membershipLevelsQueue: MembershipLevelsQueue) {}

  @OnEvent(UserEvent.POINTS_ADDED)
  async handlePointsAddEvent(payload: PointsAddedEvent): Promise<void> {
    await this.membershipLevelsQueue.checkMembershipLevel(payload);
  }
}
