import { UserGoalLevel } from './goals.dto';

export enum GoalsEvent {
  GOAL_LEVEL_SAVED = '[GOALS] GOAL LEVEL SAVED',
}

export class GoalsLevelSavedEvent {
  constructor(public userGoalLevel: UserGoalLevel) {}
}
