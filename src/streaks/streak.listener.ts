import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ScheduleSessionAddedEvent,
  ScheduleSessionEvent,
} from '../schedule-sessions/schedule-sessions.event';
import { StreaksQueue } from './streaks.queue';

@Injectable()
export class StreaksEventListener {
  private readonly logger = new Logger(StreaksEventListener.name);

  constructor(private readonly streaksQueue: StreaksQueue) {}

  @OnEvent(ScheduleSessionEvent.SESSION_ADDED)
  async handleScheduleSessionAddedEvent(
    payload: ScheduleSessionAddedEvent,
  ): Promise<void> {
    const { scheduleSession } = payload;
    this.logger.log(
      `${scheduleSession.schedule_id} session added check streaks`,
    );
    if (!scheduleSession.tool_kit_id) {
      return;
    }
    await this.streaksQueue.addStreak(scheduleSession);
  }
}
