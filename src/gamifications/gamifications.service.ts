import { Injectable, NotFoundException } from '@nestjs/common';
import { Challenge } from '../challenges/challenges.model';
import { MembershipStage } from '../membership-stages/membership-stages.model';
import {
  GamificationData,
  GamificationDataTables,
  GamificationResponse,
  GamificationToolkitStreak,
  GamificationType,
  UpdateGamificationStatusResponse,
} from './gamifications.model';
import { GamificationsRepo } from './gamifications.repo';
import { MembershipLevel } from '../membership-levels/entities/membership-level.entity';
import { Trophy } from '../trophies/entities/trophy.entity';
import { TranslationService } from '@shared/services/translation/translation.service';

@Injectable()
export class GamificationsService {
  constructor(
    private readonly gamificationsRepo: GamificationsRepo,
    private readonly translationService: TranslationService,
  ) {}

  async getGamification(userId: string): Promise<GamificationResponse> {
    const gamifications = await this.gamificationsRepo.getActiveGamifications(
      userId,
    );
    const next = gamifications.length > 1;
    const available = !!gamifications.length;
    if (!available) {
      return {
        next,
        available,
      };
    }

    const [gamification] = gamifications;
    let data: GamificationData | undefined;

    const response: GamificationResponse = {
      next,
      available,
      id: gamification.id,
      type: gamification.type,
    };
    const tableName = GamificationDataTables.get(gamification.type) as string;
    if (gamification.type === GamificationType.MEMBERSHIP_LEVEL) {
      data = await this.gamificationsRepo.getGamificationData<MembershipLevel>(
        gamification.membership_level_id,
        tableName,
      );
    }

    if (gamification.type === GamificationType.MEMBERSHIP_STAGE) {
      data = await this.gamificationsRepo.getGamificationData<MembershipStage>(
        gamification.membership_stage_id,
        tableName,
      );
    }

    if (gamification.type === GamificationType.TROPHY) {
      data = await this.gamificationsRepo.getGamificationData<Trophy>(
        gamification.trophy_id,
        tableName,
      );
    }
    if (
      gamification.type === GamificationType.CHALLENGE_GOAL ||
      gamification.type === GamificationType.CHALLENGE_WON
    ) {
      data = await this.gamificationsRepo.getGamificationData<Challenge>(
        gamification.challenge_id,
        tableName,
      );
    }

    if (gamification.type === GamificationType.TOOLKIT_STREAK) {
      data = await this.getGamificationToolkitStreak(
        gamification.toolkit_streak_id,
        userId,
      );
    }

    if (gamification.type === GamificationType.GOAL_LEVEL) {
      data = await this.gamificationsRepo.getGamificationGoalLevel(
        gamification.goal_level_id,
      );
    }
    if (!data) {
      throw new NotFoundException();
    }
    response.data = data;
    return response;
  }

  async getGamificationToolkitStreak(
    id: string,
    userId: string,
  ): Promise<GamificationToolkitStreak | undefined> {
    const toolkitStreak =
      await this.gamificationsRepo.getGamificationToolkitStreak(id);
    if (toolkitStreak) {
      const totalStreaks = await this.gamificationsRepo.getToolkitStreaks(
        toolkitStreak.tool_kit,
        userId,
      );
      return { ...toolkitStreak, total_streaks: totalStreaks };
    }
    return;
  }

  async updateGamificationStatus(
    id: string,
    userId: string,
  ): Promise<UpdateGamificationStatusResponse> {
    const gamification = await this.gamificationsRepo.getGamification(
      id,
      userId,
    );
    if (!gamification) {
      throw new NotFoundException();
    }
    await this.gamificationsRepo.updateGamificationStatus(id, userId);
    return {
      message: this.translationService.translate(`gamifications.updated`),
    };
  }
  async createGoalGamification(
    user_id: string,
    goal_level_id: string,
  ): Promise<string> {
    const checkGoalGamification =
      await this.gamificationsRepo.checkGoalGamification(
        user_id,
        goal_level_id,
      );
    if (checkGoalGamification) {
      throw new NotFoundException('GoalGamification already saved');
    }
    await this.gamificationsRepo.createGoalGamification(user_id, goal_level_id);
    return `GoalGamification created ${user_id}`;
  }

  async createMemberGamification(
    user_id: string,
    membership_level_id: string,
  ): Promise<string> {
    const checkMembershipGamification =
      await this.gamificationsRepo.checkMembershipGamification(
        user_id,
        membership_level_id,
      );
    if (checkMembershipGamification) {
      throw new NotFoundException('MembershipLevelGamification already saved');
    }
    await this.gamificationsRepo.createMembershipGamification(
      user_id,
      membership_level_id,
    );
    return `MembershipLevelGamification created ${user_id}`;
  }

  async createStreakGamification(
    user_id: string,
    streak_id: string,
  ): Promise<string> {
    const checkStreakGamification =
      await this.gamificationsRepo.checkStreakGamification(user_id, streak_id);

    if (checkStreakGamification) {
      throw new NotFoundException('StreakGamification already saved');
    }
    await this.gamificationsRepo.createStreakGamification(user_id, streak_id);
    return `StreakGamification created ${user_id}`;
  }

  async createMembershipStageGamification(
    user_id: string,
    membership_stage_id: string,
  ): Promise<string> {
    const checkmembershipStageGamification =
      await this.gamificationsRepo.checkmembershipStageGamification(
        user_id,
        membership_stage_id,
      );
    if (checkmembershipStageGamification) {
      throw new NotFoundException('MembershipStageGamification already saved');
    }
    await this.gamificationsRepo.createMembershipStageGamification(
      user_id,
      membership_stage_id,
    );
    return `MembershipStageGamification created ${user_id}`;
  }

  async createtrophiesGamification(
    user_id: string,
    trophy_id: string,
  ): Promise<string> {
    const checkTrophyGamification =
      await this.gamificationsRepo.checkTrophyGamification(user_id, trophy_id);
    if (checkTrophyGamification) {
      return 'TrophyGamification already saved';
    }
    await this.gamificationsRepo.createTrophyGamification(user_id, trophy_id);
    return `TrophyGamification created ${user_id}`;
  }
}
