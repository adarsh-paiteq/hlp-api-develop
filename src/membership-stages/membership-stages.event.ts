import { UserMembershipStage } from '../membership-stages/entities/user-membership-stages.entity';

export enum MembershipStagesEvent {
  MEMBERSHIP_STAGE_SAVED = '[STAGE] MEMBER SHIP STAGED SAVED',
}

export class MembershipStageSavedEvent {
  constructor(public userMembershipStage: UserMembershipStage) {}
}
