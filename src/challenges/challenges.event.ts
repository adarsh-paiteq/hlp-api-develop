import { UserChallenges } from './challenges.dto';
import { Challenge } from './challenges.model';

export enum ChallengesEvent {
  GOAL_COMPLETED = '[CHALLENGE] GOAL COMPLETED',
  WON = '[CHALLENGE] WON',
  CHALLENGE_ENDED = '[CHALLENGE] CHALLENGE_ENDED',
}

export class ChallengeGoalCompletedEvent {
  constructor(public userChallenge: UserChallenges) {}
}

export class ChallengeWonEvent extends ChallengeGoalCompletedEvent {}

export class ChallengeAddedEvent {
  constructor(public challenge: Challenge) {}
}

export class ChallengeUpdatedEvent {
  constructor(public challenge: Challenge) {}
}

export class ChallengeEndedEvent {
  constructor(public challenge: Challenge) {}
}
