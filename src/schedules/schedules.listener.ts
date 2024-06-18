import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ScheduleSessionEvent,
  ScheduleSessionAddedEvent,
} from '../schedule-sessions/schedule-sessions.event';
import { SchedulesQueue } from './schedules.queue';

@Injectable()
export class SchedulesListener {
  constructor(private readonly schedulesQueue: SchedulesQueue) {}
  @OnEvent(ScheduleSessionEvent.SESSION_ADDED)
  async handleScheduleSessionAddedEvent(
    payload: ScheduleSessionAddedEvent,
  ): Promise<void> {
    const { scheduleSession } = payload;
    await this.schedulesQueue.checkSchedule(scheduleSession);
  }
}
