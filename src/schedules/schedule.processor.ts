import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { defaultWorkersConcurrency } from '@core/configs/bull.config';
import { ScheduleSessionDto } from '../schedule-sessions/schedule-sessions.dto';
import { SchedulesReminderSevice } from './schedules-reminder.service';
import { ScheduleReminder, ScheduleRemindersData } from './schedules.dto';
import { SchedulesJob, SCHEDULES_QUEUE } from './schedules.queue';
import { SchedulesService } from './schedules.service';
import { ProcessorLogger } from '@core/helpers/processor-logging.helper';

const defaultConcurrency = 20;

@Processor(SCHEDULES_QUEUE)
export class SchedulesProcessor extends ProcessorLogger {
  readonly logger = new Logger(SchedulesProcessor.name);
  constructor(
    private readonly reminderService: SchedulesReminderSevice,
    private readonly schedulesService: SchedulesService,
  ) {
    super();
  }

  @Process({
    name: SchedulesJob.REMINDER,
    concurrency: defaultWorkersConcurrency,
  })
  async handleReminder(job: Job<ScheduleReminder>): Promise<string> {
    try {
      const { data: scheduleReminder } = job;
      return this.reminderService.handleScheduleReminder(scheduleReminder);
    } catch (error) {
      this.logger.error(`${this.handleReminder.name}:${error.stack}`);
      throw error;
    }
  }

  @Process({
    name: SchedulesJob.CHECK_SCHEDULE,
    concurrency: defaultConcurrency,
  })
  async checkSchedule(job: Job<ScheduleSessionDto>): Promise<string> {
    try {
      const { data } = job;
      await this.schedulesService.checkSchedule(data.schedule_id);
      return 'OK';
    } catch (error) {
      this.logger.error(`${this.checkSchedule.name}:${error.stack}`);
      throw error;
    }
  }

  @Process({
    name: SchedulesJob.REMOVE_SCHEDULE_REMINDERS,
    concurrency: defaultConcurrency,
  })
  async removeScheduleReminders(
    job: Job<ScheduleRemindersData>,
  ): Promise<string> {
    try {
      const { data } = job;
      return this.reminderService.handleRemoveScheduleReminders(data);
    } catch (error) {
      this.logger.error(`${this.removeScheduleReminders.name}:${error.stack}`);
      throw error;
    }
  }

  @Process({
    name: SchedulesJob.ADD_SCHEDULE_REMINDERS,
    concurrency: defaultConcurrency,
  })
  async addScheduleReminders(job: Job<ScheduleRemindersData>): Promise<string> {
    try {
      const { data } = job;
      return this.reminderService.handleAddScheduleReminders(data);
    } catch (error) {
      this.logger.error(`${this.addScheduleReminders.name}:${error.stack}`);
      throw error;
    }
  }
}
