import { DefaultTimelineMessageData } from './dto/treatment-timeline.dto';
import { Stage } from './entities/stage.entity';
import { TreatmentTimelineAttachment } from './entities/treatment-timeline-attachment.entity';
import { TreatmentTimeline } from './entities/treatment-timeline.entity';

export enum TreatmentTimelineEvent {
  DEFAULT_TIMELINE_MESSAGE_ADDED = '[TREATMENTS] DEFAULT_TIMELINE_MESSAGE_ADDED',
  DEFAULT_STAGE_MESSAGE_FOUND = '[TREATMENTS] DEFAULT_STAGE_MESSAGE_FOUND',
  STAGE_UPDATED = '[TREATMENTS] STAGE_UPDATED',
  FILE_ADDED_IN_TREATMENT_TIMELINE = '[TREATMENTS] FILE ADDED IN TREATMENT TIMELINE',
  NOTE_ADDED_IN_TREATMENT_TIMELINE = '[TREATMENTS] NOTE ADDED IN TREATMENT TIMELINE',
  APPOINTMENT_ADDED_IN_TREATMENT_TIMELINE = '[TREATMENTS] APPOINTMENT ADDED IN TREATMENT TIMELINE',
  TOOL_KIT_TIMELINE_MESSAGE_ADDED = '[TREATMENTS] TOOL_KIT_TIMELINE_MESSAGE_ADDED',
  FORM_ADDED_IN_TREATMENT_TIMELINE = '[TREATMENTS] FORM ADDED IN TREATMENT TIMELINE',
}

export class DefaultTimelineMessageEvent {
  constructor(public data: DefaultTimelineMessageData, public delay: number) {}
}

export class DefaultTimelineMessageAddedEvent {
  constructor(public data: DefaultTimelineMessageData) {}
}

export class StageUpdatedEvent {
  constructor(public updatedStage: Stage) {}
}

export class TreatmentTimelineFileAddedEvent {
  constructor(
    public userId: string,
    public timelineAttachment: TreatmentTimelineAttachment,
  ) {}
}

export class TreatmentTimelineNoteAddedEvent {
  constructor(
    public userId: string,
    public timelineAttachment: TreatmentTimelineAttachment,
  ) {}
}

export class TreatmentTimelineAddedEvent {
  constructor(public treatmentTimeline: TreatmentTimeline) {}
}

export class ToolkitTimelineMessageAddedEvent {
  constructor(public data: TreatmentTimeline) {}
}
