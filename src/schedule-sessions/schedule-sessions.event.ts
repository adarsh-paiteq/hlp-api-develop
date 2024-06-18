import { ScheduleSessionDto } from './schedule-sessions.dto';

export enum ScheduleSessionEvent {
  SESSION_ADDED = '[SCHEDULE] SESSION ADDED',
}

export class ScheduleSessionAddedEvent {
  constructor(public scheduleSession: ScheduleSessionDto) {}
}
