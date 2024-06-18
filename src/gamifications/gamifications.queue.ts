import { BullModule, BullModuleOptions, InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { StreakAddedEvent } from '../streaks/streaks.event';
import { GoalsLevelSavedEvent } from '../goals/goals.event';
import { MembershipLevelSavedEvent } from '../membership-levels/membership-levels.event';
import { MembershipStageSavedEvent } from '../membership-stages/membership-stages.event';
import { TrophiesAchievedEvent } from '../trophies/trophies.events';
import { defaultJobOptions } from '@core/configs/bull.config';

export const GAMIFICATIONS_QUEUE = 'gamifications';
export const gamificationsQueueConfig: BullModuleOptions = {
  name: GAMIFICATIONS_QUEUE,
  defaultJobOptions: defaultJobOptions,
};

export enum gamificationsJob {
  ADD_MEMBERSHIP_LEVEL_GAMIFICATION = '[GAMIFICATION] ADD_MEMBERSHIP_LEVEL_GAMIFICATION',
  ADD_GOAL_LEVEL_GAMIFICATION = '[GAMIFICATION] ADD_GOAL_LEVEL_GAMIFICATION',
  ADD_MEMBERSHIP_STAGE_GAMIFICATION = '[GAMIFICATION] ADD_MEMBERSHIP_STAGE_GAMIFICATION',
  ADD_TROPHY_GAMIFICATION = '[GAMIFICATION] ADD_TROPHY_GAMIFICATION',
  ADD_TOOLKIT_STREAK_GAMIFICATION = '[GAMIFICATION] ADD_TOOLKIT_STREAK_GAMIFICATION',
}

export const registerGamificationsQueue = BullModule.registerQueueAsync(
  gamificationsQueueConfig,
);

@Injectable()
export class GamificationsQueue {
  constructor(
    @InjectQueue(GAMIFICATIONS_QUEUE)
    private readonly gamificationsQueue: Queue,
  ) {}

  async checkGamificationMembershipLevel(
    payload: MembershipLevelSavedEvent,
  ): Promise<void> {
    await this.gamificationsQueue.add(
      gamificationsJob.ADD_MEMBERSHIP_LEVEL_GAMIFICATION,
      payload,
    );
  }

  async checkGamificationGoal(payload: GoalsLevelSavedEvent): Promise<void> {
    await this.gamificationsQueue.add(
      gamificationsJob.ADD_GOAL_LEVEL_GAMIFICATION,
      payload,
    );
  }

  async checkGamificationStreak(payload: StreakAddedEvent): Promise<void> {
    await this.gamificationsQueue.add(
      gamificationsJob.ADD_TOOLKIT_STREAK_GAMIFICATION,
      payload,
    );
  }

  async checkGamificationMembershipStage(
    payload: MembershipStageSavedEvent,
  ): Promise<void> {
    await this.gamificationsQueue.add(
      gamificationsJob.ADD_MEMBERSHIP_STAGE_GAMIFICATION,
      payload,
    );
  }

  async checkGamificationTrophies(
    payload: TrophiesAchievedEvent,
  ): Promise<void> {
    await this.gamificationsQueue.add(
      gamificationsJob.ADD_TROPHY_GAMIFICATION,
      payload,
    );
  }
}
