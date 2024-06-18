import { Bonus, UserBonus } from './bonuses.dto';

export enum BonusesEvent {
  BONUS_CLAIMED = '[BONUS] BONUS CLAIMED',
  BONUS_AVAILABLE = '[BONUS] BONUS AVAILABLE',
}

export class BonusClaimedEvent {
  constructor(public userBonus: UserBonus) {}
}

export class BonusAvailableEvent {
  constructor(public bonus: Bonus) {}
}
