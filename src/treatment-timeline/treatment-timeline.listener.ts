import { Injectable, Logger } from '@nestjs/common';
import { TreatmentTimelineQueue } from './treatment-timeline.queue';
import { OnEvent } from '@nestjs/event-emitter';
import {
  TreatmentAddedEvent,
  TreatmentTeamBuddyAddedEvent,
  TreatmentTeamCoachAddedEvent,
  TreatmentsEvent,
} from '@treatments/treatments.event';
import { ScheduleAddedEvent, ScheduleEvent } from '@schedules/schedule.event';
import {
  DefaultTimelineMessageAddedEvent,
  DefaultTimelineMessageEvent,
  StageUpdatedEvent,
  TreatmentTimelineEvent,
} from './treatment-timeline.event';
import { TreatmentRoles } from '@treatments/dto/add-treatment.dto';
import { StageType } from './entities/stage.entity';
import { StageMessageFrequency } from './entities/stage-messages.entity';
import { TreatmentTimelineMessageQueue } from './treatment-timeline-message.queue';
import { DefaultTimelineMessageData } from './dto/treatment-timeline.dto';

@Injectable()
export class TreatmentTimelineEventListener {
  private readonly logger = new Logger(TreatmentTimelineEventListener.name);

  constructor(
    private readonly treatmentTimelineQueue: TreatmentTimelineQueue,
    private readonly treatmentTimelineMessageQueue: TreatmentTimelineMessageQueue,
  ) {}

  @OnEvent(TreatmentsEvent.TREATMENT_TEAM_COACH_ADDED)
  async handleTreatmentTeamCoachAddedEvent(
    payload: TreatmentTeamCoachAddedEvent,
  ): Promise<void> {
    await this.treatmentTimelineQueue.addCoachTimelineMessageJob(payload);
  }

  /**
   * @description This event listener is used for adding the job that will add the
   * Treatment Timeline messages of specific @enum {StageType}:
   * `StageType.FORMS`, `StageType.TOOL_KIT`, `StageType.SLEEP_CHECK`, and `StageType.ACTIVITY`.
   */
  @OnEvent(ScheduleEvent.SCHEDULE_ADDED)
  async handleScheduleAddedEvent(payload: ScheduleAddedEvent): Promise<void> {
    await this.treatmentTimelineQueue.addScheduleTimelineMessageJob(payload);
  }

  @OnEvent(TreatmentsEvent.TREATMENT_TEAM_BUDDY_ADDED)
  async handleTreatmentTeamBuddyAddedEvent(
    payload: TreatmentTeamBuddyAddedEvent,
  ): Promise<void> {
    await this.treatmentTimelineQueue.addBuddyTimelineMessageJob(payload);
  }

  /**
   * @description This event listener is used for adding the job that will check the
   * Treatment Timeline messages of specific type
   * @enum {StageType}:`StageType.DEFAULT` and `StageType.EXPERIENCE_EXPERT`,
   * It will only check for `StageMessageFrequency.AT_BEGINNING`.
   */
  @OnEvent(TreatmentsEvent.TREATMENT_ADDED)
  async handleTreatmentAddedEvent(payload: TreatmentAddedEvent): Promise<void> {
    const { doctorTreatment, userId } = payload;
    const stageType =
      doctorTreatment.role === TreatmentRoles.experience_expert
        ? StageType.EXPERIENCE_EXPERT
        : StageType.DEFAULT;

    const jobPayload: DefaultTimelineMessageData = {
      stageType,
      treatmentId: doctorTreatment.treatment_id,
      userId,
      doctorId: doctorTreatment.doctor_id,
      frequency: StageMessageFrequency.AT_BEGINNING,
    };

    await this.treatmentTimelineMessageQueue.addCheckDefaultTimelineMessageJob(
      jobPayload,
    );
  }

  @OnEvent(TreatmentTimelineEvent.DEFAULT_STAGE_MESSAGE_FOUND)
  async handleDefaultStageMessageFoundEvent(
    payload: DefaultTimelineMessageEvent,
  ): Promise<void> {
    await this.treatmentTimelineMessageQueue.addDefaultTimelineMessageJob(
      payload,
    );
  }

  /**
   * @description This event listener is used for adding the delayed job that will add the
   * Next Frequency Treatment Timeline messages of specific
   * @enum {StageType}:`StageType.DEFAULT` and `StageType.EXPERIENCE_EXPERT`,
   * It will check for all the Frequency of @enum {StageMessageFrequency}
   * Delay is already calculated based on treatment created_at and StageMessageFrequency
   */
  @OnEvent(TreatmentTimelineEvent.DEFAULT_TIMELINE_MESSAGE_ADDED)
  async handleDefaultTimelineMessageAddedEvent(
    jobPayload: DefaultTimelineMessageAddedEvent,
  ): Promise<void> {
    await this.treatmentTimelineMessageQueue.addCheckDefaultTimelineMessageJob(
      jobPayload.data,
    );
  }

  @OnEvent(TreatmentTimelineEvent.STAGE_UPDATED)
  async handleStageUpdatedEvent(payload: StageUpdatedEvent): Promise<void> {
    await this.treatmentTimelineMessageQueue.addUpdateDefaultTimelineMessageJobsJob(
      payload,
    );
  }
}
