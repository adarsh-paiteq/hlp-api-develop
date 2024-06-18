import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { ProcessorLogger } from '@core/helpers/processor-logging.helper';
import {
  TREATMENT_TIMELINE_QUEUE,
  TreatmentTimelineJob,
} from './treatment-timeline.queue';
import { TreatmentTimelineService } from './treatment-timeline.service';
import { defaultWorkersConcurrency } from '@core/configs/bull.config';
import Bull from 'bull';
import { ScheduleAddedEvent } from '@schedules/schedule.event';
import {
  TreatmentTeamBuddyAddedEvent,
  TreatmentTeamCoachAddedEvent,
} from '@treatments/treatments.event';

@Processor(TREATMENT_TIMELINE_QUEUE)
export class TreatmentTimelineProcessor extends ProcessorLogger {
  readonly logger = new Logger(TreatmentTimelineProcessor.name);
  constructor(
    private readonly treatmentTimelineService: TreatmentTimelineService,
  ) {
    super();
  }
  @Process({
    name: TreatmentTimelineJob.ADD_COACH_TIMELINE_MESSAGE,
    concurrency: defaultWorkersConcurrency,
  })
  async handleAddCoachTimelineMessageJob(
    job: Bull.Job<TreatmentTeamCoachAddedEvent>,
  ): Promise<string> {
    try {
      const {
        data: { doctorTreatment },
      } = job;
      return await this.treatmentTimelineService.addCoachTimelineMessage(
        doctorTreatment,
      );
    } catch (error) {
      this.logger.error(
        `${this.handleAddCoachTimelineMessageJob.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: TreatmentTimelineJob.ADD_SCHEDULE_TIMELINE_MESSAGE,
    concurrency: defaultWorkersConcurrency,
  })
  async handleAddScheduleTimelineMessageJob(
    job: Bull.Job<ScheduleAddedEvent>,
  ): Promise<string> {
    try {
      const { data: payload } = job;
      return await this.treatmentTimelineService.addScheduleTimelineMessage(
        payload.schedule,
      );
    } catch (error) {
      this.logger.error(
        `${this.handleAddScheduleTimelineMessageJob.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: TreatmentTimelineJob.ADD_BUDDY_TIMELINE_MESSAGE,
    concurrency: defaultWorkersConcurrency,
  })
  async handleAddBuddyTimelineMessageJob(
    job: Bull.Job<TreatmentTeamBuddyAddedEvent>,
  ): Promise<string> {
    try {
      const {
        data: { treatmentBuddy },
      } = job;
      return await this.treatmentTimelineService.addBuddyTimelineMessage(
        treatmentBuddy,
      );
    } catch (error) {
      this.logger.error(
        `${this.handleAddBuddyTimelineMessageJob.name}:${error.stack}`,
      );
      throw error;
    }
  }
}
