import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  Schedule,
  ScheduleReminder,
  ScheduleRemindersData,
  ReminderBulkJobs,
} from './schedules.dto';
import { SchedulesJob, SchedulesQueue } from './schedules.queue';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  ScheduleEvent,
  SendAgendaReminderEvent,
  SendAppointmentReminderEvent,
  SendCheckInReminderEvent,
  SendUserToolkitReminderEvent,
} from './schedule.event';
import { SchedulesRepo } from './schedules.repo';
import { DateTime } from 'luxon';
import { ScheduleFor, ScheduleType } from './entities/schedule.entity';
import { getISODate } from '../utils/util';

@Injectable()
export class SchedulesReminderSevice {
  private logger = new Logger(SchedulesReminderSevice.name);
  constructor(
    private readonly scheduleQueue: SchedulesQueue,
    private readonly eventEmitter: EventEmitter2,
    private readonly schedulesRepo: SchedulesRepo,
  ) {}

  private parseTimeInLocalDate(time: string): DateTime {
    return DateTime.fromISO(time, { setZone: true });
  }

  private getWeeklyReminderCron(
    baseCron: string,
    schedule: Schedule,
  ): string | undefined {
    const hasWeekDays = schedule.schedule_days && schedule.schedule_days.length;
    if (!hasWeekDays) {
      this.logger.warn(`Weekly reminder has no weekdays ${schedule.id}`);
      return;
    }
    const days = schedule.schedule_days?.map((day) => day.toUpperCase());
    const daysOfWeek = days?.toString();
    const cron = `${baseCron}* * ${daysOfWeek}`;
    return cron;
  }

  private getMonthlyReminderCron(
    baseCron: string,
    schedule: Schedule,
  ): string | undefined {
    const hasDays =
      schedule.repeat_per_month && schedule.repeat_per_month.length;
    if (!hasDays) {
      return;
    }
    const days = schedule.repeat_per_month?.toString();
    const cron = `${baseCron}${days} * *`;
    return cron;
  }

  private getReminderCron(
    reminder: ScheduleReminder,
    schedule: Schedule,
  ): string | undefined {
    const localDate = this.parseTimeInLocalDate(reminder.reminder_time);
    const minutes = localDate.get('minute');
    const hours = localDate.get('hour');
    let cronString = `${minutes} ${hours} `;
    if (
      schedule.schedule_type === ScheduleType.DAILY ||
      schedule.schedule_type === ScheduleType.HABIT
    ) {
      cronString += `* * *`;
      return cronString;
    }

    if (schedule.schedule_type === ScheduleType.WEEKLY) {
      return this.getWeeklyReminderCron(cronString, schedule);
    }
    if (schedule.schedule_type === ScheduleType.MONTHLY) {
      return this.getMonthlyReminderCron(cronString, schedule);
    }
  }

  private async removeRepeatableReminder(
    reminder: ScheduleReminder,
    schedule: Schedule,
  ): Promise<void> {
    const reminders = await this.scheduleQueue.getRepeatableJobs();
    if (!reminders.length) {
      return;
    }
    const currentReminder = reminders.find(
      ($reminder) => reminder.id === $reminder.id,
    );
    if (currentReminder) {
      await this.scheduleQueue.removeRepeatableByKey(currentReminder.key);
      this.logger.log(`${reminder.reminder_time} reminder removed`);
    }
    if (!currentReminder) {
      this.logger.log(
        `No active reminder on ${reminder.reminder_time} of schdule ${schedule.id}`,
      );
    }
  }

  getReminderDelay(reminder: ScheduleReminder): number {
    const currentUtcDate = DateTime.fromJSDate(new Date()).toUTC();
    const localDate = this.parseTimeInLocalDate(reminder.reminder_time);
    const UtcDate = localDate.toUTC();
    const { milliseconds } = UtcDate.diff(currentUtcDate).toObject();
    const delay = !milliseconds || milliseconds <= 0 ? 1000 : milliseconds;
    return delay;
  }

  prepareOneTimeReminderJobs(
    scheduleReminders: ScheduleReminder[],
  ): ReminderBulkJobs[] {
    return scheduleReminders.map((reminder) => {
      return {
        name: SchedulesJob.REMINDER,
        data: reminder,
        opts: {
          jobId: reminder.id,
          delay: this.getReminderDelay(reminder),
        },
      };
    });
  }

  async handleRemoveScheduleReminders(
    data: ScheduleRemindersData,
  ): Promise<string> {
    const { schedule, reminders } = data;
    const isOneTimeReminder = schedule.schedule_type === ScheduleType.ONE_TIME;
    if (isOneTimeReminder) {
      const jobIds = reminders.map((reminder) => reminder.id);

      await this.scheduleQueue.removeReminderJobs(jobIds);
      return `Reminders Removed for ${schedule.id}`;
    }
    for (const reminder of reminders) {
      await this.removeRepeatableReminder(reminder, schedule);
    }
    return `Reminders Removed for ${schedule.id}`;
  }

  async handleAddScheduleReminders(
    data: ScheduleRemindersData,
  ): Promise<string> {
    const { schedule, reminders } = data;
    const isOneTimeReminder = schedule.schedule_type === ScheduleType.ONE_TIME;
    if (isOneTimeReminder) {
      const reminderJobs = this.prepareOneTimeReminderJobs(reminders);
      this.logger.log(reminderJobs);
      await this.scheduleQueue.addReminderJobs(reminderJobs);
      return `${schedule.schedule_type} Schedule Reminders Added for ${schedule.id}`;
    }
    for (const reminder of reminders) {
      const cron = this.getReminderCron(reminder, schedule);
      const localDate = this.parseTimeInLocalDate(reminder.reminder_time);
      const localTimeZone = localDate.zoneName as string;
      if (!cron) {
        this.logger.warn(`Unable to add reminder for ${schedule.id}`);
        return 'Unable to add repeatable reminder';
      }
      await this.scheduleQueue.addRepeatableReminder(
        reminder,
        cron,
        localTimeZone,
      );
      this.logger.log(
        `Repeatbale ${cron} reminder added for schedule ${schedule.id}`,
      );
    }
    return `${schedule.schedule_type} Schedule Reminders Added`;
  }

  async removeScheduleReminders(
    schedule: Schedule,
    reminders: ScheduleReminder[],
  ): Promise<void> {
    if (!reminders.length) {
      this.logger.log(`No reminders for this schedule`);
      return;
    }
    const data: ScheduleRemindersData = {
      schedule: schedule,
      reminders: reminders,
    };
    await this.scheduleQueue.removeScheduleReminders(data);
  }

  async addScheduleReminders(
    schedule: Schedule,
    reminders: ScheduleReminder[],
  ): Promise<void> {
    if (!reminders.length) {
      this.logger.log(`No reminders for this schedule`);
      return;
    }

    const data: ScheduleRemindersData = {
      schedule: schedule,
      reminders: reminders,
    };

    await this.scheduleQueue.addScheduleReminders(data);
  }

  isScheduledDisableByUser(date: string): boolean {
    const currentDate = getISODate(new Date());
    const endDate = getISODate(new Date(date));
    return endDate <= currentDate;
  }

  async handleScheduleReminder(
    scheduleReminder: ScheduleReminder,
  ): Promise<string> {
    const { schedule_id, user_id } = scheduleReminder;
    this.logger.log(scheduleReminder);
    const schedule = await this.schedulesRepo.getSchedule(schedule_id);
    if (!schedule) {
      throw new NotFoundException(`Schedule not found`);
    }
    const { schedule_for, is_schedule_disabled, end_date, schedule_type } =
      schedule;
    let isScheduleDisabled = is_schedule_disabled;

    if (schedule_type === ScheduleType.HABIT && end_date) {
      isScheduleDisabled = this.isScheduledDisableByUser(end_date);
      if (isScheduleDisabled) {
        this.logger.log(
          `isScheduleDisabled is ${isScheduleDisabled}  in ${schedule.id}`,
        );
      }
    }
    if (is_schedule_disabled && end_date) {
      isScheduleDisabled = this.isScheduledDisableByUser(end_date);
    }

    if (isScheduleDisabled) {
      const reminders = await this.schedulesRepo.getRemindersByScheduelId(
        schedule_id,
      );
      await this.removeScheduleReminders(schedule, reminders);
      return 'Schedule is disabled by user, removing reminder jobs';
    }

    if (schedule_for === ScheduleFor.CHECK_IN) {
      const checkIn = await this.schedulesRepo.getCheckInByScheduleId(
        schedule_id,
        user_id,
      );
      if (!checkIn) {
        return `No Check-in reminders for this schedule`;
      }
      this.eventEmitter.emit(
        ScheduleEvent.SEND_CHECK_IN_REMINDER,
        new SendCheckInReminderEvent(scheduleReminder, checkIn),
      );
      return `Sending Check-in Reminder Notification`;
    }

    if (schedule_for === ScheduleFor.APPOINTMENT) {
      const userAppointment =
        await this.schedulesRepo.getUserAppointmentByScheduleId(
          schedule_id,
          user_id,
        );
      if (!userAppointment) {
        return `No Appointment reminders for this schedule`;
      }
      this.eventEmitter.emit(
        ScheduleEvent.SEND_USER_APPOINTMENT_REMINDER,
        new SendAppointmentReminderEvent(scheduleReminder, userAppointment),
      );
      return `Sending Appointment Reminder Notification`;
    }

    if (schedule_for === ScheduleFor.USER_TOOLKIT) {
      const userToolkit = await this.schedulesRepo.getUserToolkitByScheduleId(
        schedule_id,
        user_id,
      );
      if (!userToolkit) {
        return `No Activity reminders for this schedule`;
      }
      this.eventEmitter.emit(
        ScheduleEvent.SEND_USER_TOOLKIT_REMINDER,
        new SendUserToolkitReminderEvent(scheduleReminder, userToolkit),
      );
      return `Sending Activity Reminder Notification`;
    }

    const agenda = await this.schedulesRepo.getToolKitBySchedule(
      schedule_id,
      user_id,
    );
    if (!agenda) {
      return `No Agenda reminders for this schedule`;
    }
    this.eventEmitter.emit(
      ScheduleEvent.SEND_AGENDA_REMINDER,
      new SendAgendaReminderEvent(scheduleReminder, agenda),
    );
    return `Sending Agenda Reminder Notification`;
  }
}
