import { UserMembershipLevel } from './membership-levels.dto';

export const enum MembershipLevelsEvent {
  MEMBERSHIP_LEVEL_SAVED = '[LEVEL] MEMBERSHIP_LEVEL_SAVED',
}

export class MembershipLevelSavedEvent {
  constructor(public userMembershipLevel: UserMembershipLevel) {}
}
