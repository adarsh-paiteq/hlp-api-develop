import { UserMoodCheck } from './entities/user-mood-check.entity';

export enum UserMoodChecksEvent {
  MOOD_CHECK_SAVED = 'MOOD_CHECK_ADDED',
}

export class UserMoodCheckSavedEvent {
  constructor(public userMoodCheck: UserMoodCheck) {}
}
