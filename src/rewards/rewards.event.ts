import { UserRewards } from './entities/user-rewards.entity';

export enum RewardEvent {
  REWARD_ADDED = '[REWARD] REWARD ADDED',
}

export class RewardAddedEvent {
  constructor(public reward: UserRewards) {}
}
