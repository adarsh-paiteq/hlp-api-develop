import { Toolkit } from '../toolkits/toolkits.model';
import { Checkin } from '../checkins/entities/check-ins.entity';
import { ScheduleReminder } from '../schedules/schedules.dto';
import { ScheduleEntity } from './entities/schedule.entity';
import { UserAppointment } from '@toolkits/entities/user-appointment.entity';
import { UserTookit } from '@toolkits/entities/user-toolkits.entity';

export enum ScheduleEvent {
  SEND_CHECK_IN_REMINDER = '[SCHEDULE] SEND CHECK IN REMINDER',
  SEND_AGENDA_REMINDER = '[SCHEDULE] SEND AGENDA REMINDER',
  SCHEDULE_ADDED = '[SCHEDULE] SCHEDULE ADDED',
  SEND_USER_APPOINTMENT_REMINDER = '[SCHEDULE] SEND USER APPOINTMENT REMINDER',
  SEND_USER_TOOLKIT_REMINDER = '[SCHEDULE] SEND_USER_TOOLKIT_REMINDER',
}

export class SendCheckInReminderEvent {
  constructor(
    public scheduleReminder: ScheduleReminder,
    public checkIn: Checkin,
  ) {}
}

export class SendAgendaReminderEvent {
  constructor(
    public scheduleReminder: ScheduleReminder,
    public agenda: Toolkit,
  ) {}
}

export class ScheduleAddedEvent {
  constructor(public schedule: ScheduleEntity) {}
}

export class SendAppointmentReminderEvent {
  constructor(
    public scheduleReminder: ScheduleReminder,
    public userAppointment: UserAppointment,
  ) {}
}

export class SendUserToolkitReminderEvent {
  constructor(
    public scheduleReminder: ScheduleReminder,
    public userTookit: UserTookit,
  ) {}
}
