import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  CheckMembershipLevelDto,
  MembershipLevel,
  MembershipLevelUnlockedItem,
  SaveUserMembershipLevel,
  UserMembershipLevel,
} from './membership-levels.dto';
import {
  MembershipLevelSavedEvent,
  MembershipLevelsEvent,
} from './membership-levels.event';
import { MembershipLevelsRepo } from './membership-levels.repo';
import { TranslationService } from '@shared/services/translation/translation.service';

@Injectable()
export class MembershipLevelsService {
  private readonly logger = new Logger(MembershipLevelsService.name);
  constructor(
    private readonly membershipLevelsRepo: MembershipLevelsRepo,
    private readonly eventEmitter: EventEmitter2,
    private readonly translationService: TranslationService,
  ) {}

  private async getNextMembershipLevel(
    userId: string,
    points: number,
  ): Promise<MembershipLevel | undefined> {
    const levels =
      await this.membershipLevelsRepo.getMembershipLevelsWithStatus(userId);
    if (!levels) {
      return;
    }
    const completedStagesTotalPoints = levels
      .filter((level) => level.is_completed)
      .reduce(
        (a, stage) => a + stage.hlp_reward_points_to_complete_this_level,
        0,
      );
    const nextLevel = levels.find((level) => {
      const requiredPoints =
        level.hlp_reward_points_to_complete_this_level +
        completedStagesTotalPoints;
      return !level.is_completed && points >= requiredPoints;
    });
    if (!nextLevel) {
      return;
    }
    return nextLevel;
  }

  /**
   * @description This service is used by the @function checkMembershipLevel() function within membership-level service.
     Also, the `CHECK_MEMBERSHIP_LEVEL` event is associated with this membership-levels processor.
   */
  private async saveUserMembershipLevel(
    userId: string,
    membershipLevel: MembershipLevel,
  ): Promise<UserMembershipLevel> {
    const userMembershipLevel: SaveUserMembershipLevel = {
      user_id: userId,
      membership_level_id: membershipLevel.id,
      is_level_completed_by_user: true,
    };
    return this.membershipLevelsRepo.saveUserMembershipStage(
      userMembershipLevel,
    );
  }

  /**
   * @description This service is used by the @function getNextMembershipLevelTest() function within membership-level controller.
   */
  async checkMembershipLevel(body: CheckMembershipLevelDto): Promise<string> {
    const { userId } = body;
    const points = await this.membershipLevelsRepo.getUserEarnedPoints(userId);
    const nextLevel = await this.getNextMembershipLevel(userId, points);
    if (!nextLevel) {
      const message = `No Matched Level  found for hlp points  ${points}`;
      this.logger.log(message);
      return message;
    }
    const userMembershipLevel =
      await this.membershipLevelsRepo.getUserMembershipLevel(
        nextLevel.id,
        userId,
      );
    if (userMembershipLevel) {
      const message = `${userId} user already reached new membership stage ${nextLevel.id}(${nextLevel.title})`;
      this.logger.log(message);
      return message;
    }
    const savedLevel = await this.saveUserMembershipLevel(userId, nextLevel);
    this.eventEmitter.emit(
      MembershipLevelsEvent.MEMBERSHIP_LEVEL_SAVED,
      new MembershipLevelSavedEvent(savedLevel),
    );
    const message = `${userId} user reached new membership stage ${savedLevel.membership_level_id}(${nextLevel.title})`;
    this.logger.log(message);
    return message;
  }

  private getUnlockItems(
    membershipLevels: MembershipLevel[],
    lang?: string,
  ): MembershipLevel[] {
    const translatedMembershipLevel = this.translationService.getTranslations(
      membershipLevels,
      ['title', 'description'],
      lang,
    );
    const levels = translatedMembershipLevel.map((level) => {
      const isCompleted = level.is_completed !== null;
      const progress_percentage = isCompleted ? 100 : 0;
      const unlockItems: MembershipLevelUnlockedItem[] = [
        {
          name: this.translationService.translate(`membership_level.hlp`),
          is_unlocked: isCompleted,
          value: level.hlp_reward_points,
        },
      ];
      const currentPoints = isCompleted
        ? level.hlp_reward_points_to_complete_this_level
        : 0;
      return {
        ...level,
        is_completed: isCompleted,
        progress_percentage,
        unlocked_items: unlockItems,
        current_hlp_reward_points: currentPoints,
      };
    });

    return levels;
  }

  async getUserMembershipLevelSummary(
    body: CheckMembershipLevelDto,
    lang?: string,
  ): Promise<MembershipLevel[]> {
    const { userId, points } = body;
    const membershipLevels =
      await this.membershipLevelsRepo.getMembershipLevelsWithStatus(userId);
    if (!membershipLevels.length) {
      return [];
    }

    const levels = this.getUnlockItems(membershipLevels, lang);
    const completedStagesTotalPoints = levels
      .filter((level) => level.is_completed)
      .reduce(
        (a, stage) => a + stage.hlp_reward_points_to_complete_this_level,
        0,
      );
    const nextLevelIndex = levels.findIndex((level) => !level.is_completed);
    if (nextLevelIndex < 0) {
      return levels;
    }
    const availablePoints =
      points >= completedStagesTotalPoints
        ? points - completedStagesTotalPoints
        : 0;
    const mappedLevels = levels.map((level, index) => {
      if (nextLevelIndex >= 0 && nextLevelIndex === index) {
        const requiredPoints = level.hlp_reward_points_to_complete_this_level;
        const progress_percentage = Math.round(
          (availablePoints / requiredPoints) * 100,
        );
        return {
          ...level,
          current_hlp_reward_points: availablePoints,
          progress_percentage,
        };
      }
      return level;
    });
    return mappedLevels;
  }
}
