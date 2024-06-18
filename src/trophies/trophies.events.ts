import { UserTrophy } from './trophies.dto';

export enum TrophiesEvent {
  TROPHIES_ACHIVED = '[TROPHIES] TROPHIES_ACHIVED',
}
export class TrophiesAchievedEvent {
  constructor(public userTrophy: UserTrophy) {}
}
