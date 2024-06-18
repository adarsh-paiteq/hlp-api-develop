import { DoctorTreatment } from './entities/doctor-treatments.entity';
import { TreatmentBuddy } from './entities/treatment-buddy.entity';
import { Treatment } from './entities/treatments.entity';

export enum TreatmentsEvent {
  TREATMENT_TEAM_COACH_ADDED = '[TREATMENTS] TREATMENT_TEAM_COACH_ADDED',
  TREATMENT_TEAM_BUDDY_ADDED = '[TREATMENTS] TREATMENT_TEAM_BUDDY_ADDED',
  TREATMENT_ADDED = '[TREATMENTS] TREATMENT_ADDED',
  TREATMENT_CLOSED = '[TREATMENTS] TREATMENT_CLOSED',
  START_PROGRAM_TREATMENT_DELETED = '[TREATMENTS] START_PROGRAM_TREATMENT_DELETED',
  DOCTOR_TREATMENT_ARCHIVE_STATUS_UPDATED = '[TREATMENTS] DOCTOR_TREATMENT_ARCHIVE_STATUS_UPDATED',
  TREATMENT_FILE_ATTACHED = '[TREATMENTS] TREATMENT_FILE_ATTACHED',
}

export class DoctorTreatmentCreatedEvent {
  constructor(public doctorId: string, public userId: string) {}
}

export class TreatmentTeamCoachAddedEvent {
  constructor(public doctorTreatment: DoctorTreatment) {}
}

export class TreatmentTeamBuddyAddedEvent {
  constructor(public treatmentBuddy: TreatmentBuddy) {}
}

export class TreatmentAddedEvent {
  constructor(public userId: string, public doctorTreatment: DoctorTreatment) {}
}

export class TreatmentClosedEvent {
  constructor(public treatment: Treatment) {}
}

export class StartProgramTreatmentDeletedEvent {
  constructor(public treatment: Treatment) {}
}

export class DoctorTreatmentArchiveStatusUpdatedEvent {
  constructor(public doctorTreatment: DoctorTreatment) {}
}

export class TreatmentFileAttachedEvent {
  constructor(public treatmentId: string, public userId: string) {}
}
