import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { GoalsEvent, GoalsLevelSavedEvent } from '../goals/goals.event';
import {
  MembershipLevelSavedEvent,
  MembershipLevelsEvent,
} from '../membership-levels/membership-levels.event';
import {
  MembershipStageSavedEvent,
  MembershipStagesEvent,
} from '../membership-stages/membership-stages.event';
// import { StreakAddedEvent, StreakEvent } from '../streaks/streaks.event';
import {
  TrophiesAchievedEvent,
  TrophiesEvent,
} from '../trophies/trophies.events';
import { GamificationsQueue } from './gamifications.queue';

@Injectable()
export class GamificationsListener {
  private readonly logger = new Logger(GamificationsListener.name);
  constructor(private readonly gamificationsQueue: GamificationsQueue) {}
  @OnEvent(GoalsEvent.GOAL_LEVEL_SAVED)
  async handleGoalLevelSavedEvent(
    payload: GoalsLevelSavedEvent,
  ): Promise<void> {
    this.logger.log(`Add Goal level gamification ${JSON.stringify(payload)}`);
    await this.gamificationsQueue.checkGamificationGoal(payload);
  }

  @OnEvent(MembershipLevelsEvent.MEMBERSHIP_LEVEL_SAVED)
  async handleMembershipLevelSavedEvent(
    payload: MembershipLevelSavedEvent,
  ): Promise<void> {
    this.logger.log(
      `Add membership level gamification ${JSON.stringify(payload)}`,
    );
    await this.gamificationsQueue.checkGamificationMembershipLevel(payload);
  }

  //   @OnEvent(StreakEvent.STREAK_ADDED)
  //   async handleStreakAddedEvent(payload: StreakAddedEvent): Promise<void> {
  //     this.logger.log(
  //       `Add toolkit streak gamification ${JSON.stringify(payload)}`,
  //     );
  //     await this.gamificationsQueue.checkGamificationStreak(payload);
  //   }

  @OnEvent(MembershipStagesEvent.MEMBERSHIP_STAGE_SAVED)
  async handleMembershipStagedSavedEvent(
    payload: MembershipStageSavedEvent,
  ): Promise<void> {
    this.logger.log(
      `Add membership stage gamification ${JSON.stringify(payload)}`,
    );
    await this.gamificationsQueue.checkGamificationMembershipStage(payload);
  }

  @OnEvent(TrophiesEvent.TROPHIES_ACHIVED)
  async handleTrophiesAchievedEvent(
    payload: TrophiesAchievedEvent,
  ): Promise<void> {
    this.logger.log(`Add Trophies Achieved reward ${JSON.stringify(payload)}`);
    await this.gamificationsQueue.checkGamificationTrophies(payload);
  }
}
