import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ScheduleSessionEvent,
  ScheduleSessionAddedEvent,
} from '../schedule-sessions/schedule-sessions.event';
import { GoalsQueue } from './goals.queue';
import { UserEvent, UserSignedUpEvent } from '@users/user.event';

@Injectable()
export class GoalsListener {
  constructor(private readonly goalsQueue: GoalsQueue) {}

  @OnEvent(ScheduleSessionEvent.SESSION_ADDED)
  async handleScheduleSessionAddedEvent(
    payload: ScheduleSessionAddedEvent,
  ): Promise<void> {
    const { scheduleSession } = payload;
    if (!scheduleSession.tool_kit_id) {
      return;
    }
    await this.goalsQueue.checkGoalLevelQueue({
      user_id: scheduleSession.user_id,
      tool_kit_id: scheduleSession.tool_kit_id,
    });
  }

  @OnEvent(UserEvent.USER_SIGNED_UP)
  async handleUserSignedUpEvent(payload: UserSignedUpEvent): Promise<void> {
    await this.goalsQueue.addUserGoal(payload.user.id);
  }
}
