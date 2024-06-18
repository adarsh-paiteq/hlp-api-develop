import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ScheduleSessionAddedEvent,
  ScheduleSessionEvent,
} from '../schedule-sessions/schedule-sessions.event';
import { CheckinsQueue } from './checkins.queue';

@Injectable()
export class CheckinsListener {
  private readonly logger = new Logger(CheckinsListener.name);
  constructor(private readonly checkinsLevelsQueue: CheckinsQueue) {}

  @OnEvent(ScheduleSessionEvent.SESSION_ADDED)
  async handleCheckinEvent(payload: ScheduleSessionAddedEvent): Promise<void> {
    this.logger.log(`Check checkin level ${JSON.stringify(payload)}`);
    if (!payload.scheduleSession.checkin_id) return;
    await this.checkinsLevelsQueue.checkCheeckinLevel(payload);
  }
}
