import { defaultJobOptions } from '@core/configs/bull.config';
import { BullModule, BullModuleOptions, InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { ScheduleAddedEvent } from '@schedules/schedule.event';
import {
  TreatmentTeamBuddyAddedEvent,
  TreatmentTeamCoachAddedEvent,
} from '@treatments/treatments.event';
import { Queue } from 'bull';

export const TREATMENT_TIMELINE_QUEUE = 'treatmentTimeline';
export const treatmentTimelineQueueConfig: BullModuleOptions = {
  name: TREATMENT_TIMELINE_QUEUE,
  defaultJobOptions: defaultJobOptions,
};
export const registerTreatmentTimelineQueue = BullModule.registerQueueAsync(
  treatmentTimelineQueueConfig,
);

export enum TreatmentTimelineJob {
  ADD_COACH_TIMELINE_MESSAGE = '[TREATMENT_TIMELINE] ADD COACH TIMELINE MESSAGE',
  ADD_SCHEDULE_TIMELINE_MESSAGE = '[TREATMENT_TIMELINE] ADD SCHEDULE TIMELINE MESSAGE',
  ADD_BUDDY_TIMELINE_MESSAGE = '[TREATMENT_TIMELINE] ADD BUDDY TIMELINE MESSAGE',
}

@Injectable()
export class TreatmentTimelineQueue {
  private logger = new Logger(TreatmentTimelineQueue.name);
  constructor(
    @InjectQueue(TREATMENT_TIMELINE_QUEUE)
    private readonly treatmentTimelineQueue: Queue,
  ) {}

  async addCoachTimelineMessageJob(
    payload: TreatmentTeamCoachAddedEvent,
  ): Promise<void> {
    await this.treatmentTimelineQueue.add(
      TreatmentTimelineJob.ADD_COACH_TIMELINE_MESSAGE,
      payload,
    );
  }

  async addScheduleTimelineMessageJob(
    payload: ScheduleAddedEvent,
  ): Promise<void> {
    await this.treatmentTimelineQueue.add(
      TreatmentTimelineJob.ADD_SCHEDULE_TIMELINE_MESSAGE,
      payload,
    );
  }

  async addBuddyTimelineMessageJob(
    payload: TreatmentTeamBuddyAddedEvent,
  ): Promise<void> {
    await this.treatmentTimelineQueue.add(
      TreatmentTimelineJob.ADD_BUDDY_TIMELINE_MESSAGE,
      payload,
    );
  }
}
