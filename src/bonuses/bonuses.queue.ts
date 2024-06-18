import { BullModule, BullModuleOptions, InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { defaultJobOptions } from '@core/configs/bull.config';

export const BONUSES_QUEUE = 'bonuses';
export const bonusesQueueConfig: BullModuleOptions = {
  name: BONUSES_QUEUE,
  defaultJobOptions: defaultJobOptions,
};

export enum BonusesJob {
  CHECK_CHECKIN_BONUS = 'CHECK CHECKIN BONUS',
  CHECK_TOOLKIT_BONUS = 'CHECK TOOLKIT BONUS',
  CHECK_TROPHY_BONUS = 'CHECK TROPHY BONUS',
}

export const registerBonusesQueue =
  BullModule.registerQueueAsync(bonusesQueueConfig);

@Injectable()
export class BonusesQueue {
  constructor(
    @InjectQueue(BONUSES_QUEUE) private readonly bonusesQueue: Queue,
  ) {}

  async checkCheckinBonus(userId: string): Promise<void> {
    await this.bonusesQueue.add(BonusesJob.CHECK_CHECKIN_BONUS, userId);
  }

  async checkTookitBonus(userId: string): Promise<void> {
    await this.bonusesQueue.add(BonusesJob.CHECK_TOOLKIT_BONUS, userId);
  }
  async checkTrophyBonus(userId: string): Promise<void> {
    await this.bonusesQueue.add(BonusesJob.CHECK_TROPHY_BONUS, userId);
  }
}
