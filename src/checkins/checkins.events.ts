import { UserCheckinLevel } from './checkins.dto';

export enum CheckinEvent {
  USER_CHECKIN_LEVEL_SAVED = '[CHECKIN] USER_CHECKIN_LEVEL_SAVED ',
}

export class UserCheckinLevelSavedEvent {
  constructor(public userCheckinLevel: UserCheckinLevel) {}
}
