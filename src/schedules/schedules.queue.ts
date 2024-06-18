import { BullModule, BullModuleOptions, InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import Bull, { Queue } from 'bull';
import { defaultJobOptions } from '@core/configs/bull.config';
import { ScheduleSessionDto } from '../schedule-sessions/schedule-sessions.dto';
import {
  ReminderBulkJobs,
  ScheduleReminder,
  ScheduleRemindersData,
} from './schedules.dto';
export const SCHEDULES_QUEUE = 'schedules';
export interface IJob<T> {
  opts?: Bull.JobOptions;
  data?: T;
  name?: string;
}
export enum SchedulesJob {
  REMOVE_SCHEDULE_REMINDERS = '[SCHEDULE] REMOVE_SCHEDULE_REMINDERS',
  ADD_SCHEDULE_REMINDERS = '[SCHEDULE] ADD_SCHEDULE_REMINDERS',
  REMINDER = '[SCHEDULE] REMINDER',
  CHECK_SCHEDULE = '[SCHEDULE] CHECK',
}

export const schedulesQueueConfig: BullModuleOptions = {
  name: SCHEDULES_QUEUE,
  defaultJobOptions: defaultJobOptions,
};

export const registerSchedulesQueue =
  BullModule.registerQueueAsync(schedulesQueueConfig);

@Injectable()
export class SchedulesQueue {
  private logger = new Logger(SchedulesQueue.name);
  constructor(
    @InjectQueue(SCHEDULES_QUEUE) private readonly schedulesQueue: Queue,
  ) {}
  async getJob(id: string): Promise<Bull.Job<any> | null> {
    return this.schedulesQueue.getJob(id);
  }
  async removeRepeatableByKey(id: string): Promise<void> {
    return this.schedulesQueue.removeRepeatableByKey(id);
  }

  async getRepeatableJobs(): Promise<Bull.JobInformation[]> {
    return this.schedulesQueue.getRepeatableJobs();
  }

  async addRepeatableReminder(
    data: ScheduleReminder,
    cron: string,
    localTimeZone: string,
  ): Promise<Bull.Job<ScheduleReminder>> {
    const job: Bull.JobOptions = {
      repeat: {
        cron,
        tz: localTimeZone,
      },
      jobId: data.id,
    };
    return this.schedulesQueue.add(SchedulesJob.REMINDER, data, job);
  }

  async checkSchedule(scheduleSession: ScheduleSessionDto): Promise<void> {
    await this.schedulesQueue.add(SchedulesJob.CHECK_SCHEDULE, scheduleSession);
  }

  async removeScheduleReminders(data: ScheduleRemindersData): Promise<void> {
    await this.schedulesQueue.add(SchedulesJob.REMOVE_SCHEDULE_REMINDERS, data);
  }
  async addScheduleReminders(data: ScheduleRemindersData): Promise<void> {
    await this.schedulesQueue.add(SchedulesJob.ADD_SCHEDULE_REMINDERS, data);
  }

  async addReminderJobs(reminderJobs: ReminderBulkJobs[]): Promise<void> {
    await this.schedulesQueue.addBulk(reminderJobs);
  }

  async removeReminderJobs(jobIds: string[]): Promise<void> {
    const jobs = jobIds.map((id) => this.schedulesQueue.removeJobs(id));
    Promise.all(jobs);
  }
}
