import { Process, Processor } from '@nestjs/bull';
import { gamificationsJob, GAMIFICATIONS_QUEUE } from './gamifications.queue';
import { Logger } from '@nestjs/common';
import Bull from 'bull';
import { GamificationsService } from './gamifications.service';
import { MembershipLevelSavedEvent } from '../membership-levels/membership-levels.event';
import { GoalsLevelSavedEvent } from '../goals/goals.event';
import { StreakAddedEvent } from '../streaks/streaks.event';
import { MembershipStageSavedEvent } from '../membership-stages/membership-stages.event';
import { TrophiesAchievedEvent } from '../trophies/trophies.events';
import { defaultWorkersConcurrency } from '@core/configs/bull.config';
import { ProcessorLogger } from '@core/helpers/processor-logging.helper';

@Processor(GAMIFICATIONS_QUEUE)
export class GamificationsProcessor extends ProcessorLogger {
  readonly logger = new Logger(GamificationsProcessor.name);
  constructor(private readonly gamificationsService: GamificationsService) {
    super();
  }

  @Process({
    name: gamificationsJob.ADD_MEMBERSHIP_LEVEL_GAMIFICATION,
    concurrency: defaultWorkersConcurrency,
  })
  async checkMembershipLevelGamification(
    job: Bull.Job<MembershipLevelSavedEvent>,
  ): Promise<string> {
    try {
      const {
        data: {
          userMembershipLevel: { user_id, membership_level_id },
        },
      } = job;
      const result = await this.gamificationsService.createMemberGamification(
        user_id,
        membership_level_id,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `${this.checkMembershipLevelGamification.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: gamificationsJob.ADD_GOAL_LEVEL_GAMIFICATION,
    concurrency: defaultWorkersConcurrency,
  })
  async checkGoalGamification(
    job: Bull.Job<GoalsLevelSavedEvent>,
  ): Promise<string> {
    try {
      const {
        data: {
          userGoalLevel: { user_id, goal_level_id },
        },
      } = job;
      const result = await this.gamificationsService.createGoalGamification(
        user_id,
        goal_level_id,
      );
      return result;
    } catch (error) {
      this.logger.error(`${this.checkGoalGamification.name}:${error.stack}`);
      throw error;
    }
  }

  @Process({
    name: gamificationsJob.ADD_TOOLKIT_STREAK_GAMIFICATION,
    concurrency: defaultWorkersConcurrency,
  })
  async checkStreakGamification(
    job: Bull.Job<StreakAddedEvent>,
  ): Promise<string> {
    try {
      const {
        data: {
          streak: { user_id, streak_id },
        },
      } = job;
      const result = await this.gamificationsService.createStreakGamification(
        user_id,
        streak_id,
      );
      return result;
    } catch (error) {
      this.logger.error(`${this.checkStreakGamification.name}:${error.stack}`);
      throw error;
    }
  }

  @Process({
    name: gamificationsJob.ADD_MEMBERSHIP_STAGE_GAMIFICATION,
    concurrency: defaultWorkersConcurrency,
  })
  async checkMembershipStageGamification(
    job: Bull.Job<MembershipStageSavedEvent>,
  ): Promise<string> {
    try {
      const {
        data: {
          userMembershipStage: { user_id, membership_stage_id },
        },
      } = job;
      const result =
        await this.gamificationsService.createMembershipStageGamification(
          user_id,
          membership_stage_id,
        );
      return result;
    } catch (error) {
      this.logger.error(
        `${this.checkMembershipStageGamification.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: gamificationsJob.ADD_TROPHY_GAMIFICATION,
    concurrency: defaultWorkersConcurrency,
  })
  async checkTrophyGamification(
    job: Bull.Job<TrophiesAchievedEvent>,
  ): Promise<string> {
    try {
      const {
        data: {
          userTrophy: { user_id, trophy_id },
        },
      } = job;
      const result = await this.gamificationsService.createtrophiesGamification(
        user_id,
        trophy_id,
      );
      return result;
    } catch (error) {
      this.logger.error(`${this.checkTrophyGamification.name}:${error.stack}`);
      throw error;
    }
  }
}
