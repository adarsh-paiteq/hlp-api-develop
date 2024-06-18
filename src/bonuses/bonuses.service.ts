import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserMembershipStage } from '../membership-stages/entities/user-membership-stages.entity';
import {
  Bonus,
  BonusType,
  ClaimBonusResponseDto,
  GetBonusesParamDto,
  GetCheckinBonusQuery,
  GetCheckinBonusResponse,
  GetToolkitBonuseResponse,
  GetToolkitBonusQuery,
  GetTrophyBonuseQuery,
  GetTrophyBonusResponse,
} from './bonuses.dto';
import {
  BonusAvailableEvent,
  BonusClaimedEvent,
  BonusesEvent,
} from './bonuses.event';
import { BonusesRepo } from './bonuses.repo';
import { UserBonusClaimed } from './entities/user-bonus.entity';
import { GetBonusesWithMembership } from './dto/get-bonus.dto';
import { TranslationService } from '@shared/services/translation/translation.service';
import { Bonuses } from './entities/bonus.entity';
import { MembershipStage } from '@membership-stages/membership-stages.model';

@Injectable()
export class BonusesService {
  private logger = new Logger(BonusesService.name);
  constructor(
    private readonly bonusesRepo: BonusesRepo,
    private readonly eventEmitter: EventEmitter2,
    private readonly translationService: TranslationService,
  ) {}

  /**
   * This function is deprecated and should not be used.
   * This code is only included for backward compatibility.
   * Use the @function getBonusesNew() function instead.
   * @deprecated
   */
  async getBonuses(param: GetBonusesParamDto): Promise<{ bonuses: Bonus[] }> {
    const { id } = param;
    const bonuses = await this.bonusesRepo.getBonusesWithStatusAndTotal(id);
    const finalBonuses = bonuses.map((bonus) => {
      let is_condition_satisfied = false;
      let progressPercentage = 0;
      let requiredTotal = 0;
      const { total: currentTotal } = bonus;
      const { has_membership_stage: hasMembershiStage } = bonus;
      if (bonus.bonus_type === BonusType.CHECK_IN) {
        requiredTotal = bonus.number_of_check_ins_to_be_completed;
      }
      if (bonus.bonus_type === BonusType.TOOL_KIT) {
        requiredTotal = bonus.number_of_tools_to_be_completed;
      }
      if (bonus.bonus_type === BonusType.TROPHY) {
        requiredTotal = bonus.number_of_trophies_to_be_earned;
      }
      const hasRequiredTotal = currentTotal >= requiredTotal;
      is_condition_satisfied = hasRequiredTotal;
      progressPercentage = (currentTotal / requiredTotal) * 100;
      const canClaim = is_condition_satisfied && hasMembershiStage;
      // make use progress percentage always <= 100
      progressPercentage =
        progressPercentage > 100
          ? 100
          : Math.abs(Math.floor(progressPercentage));
      return {
        ...bonus,
        can_claim: canClaim,
        progress_percentage: progressPercentage,
      };
    });
    return { bonuses: finalBonuses };
  }
  /**
   * This function is deprecated and should not be used.
   * This code is only included for backward compatibility.
   * Use the @function claimBonusNew() function instead.
   * @deprecated
   */

  async claimBonus(id: string, userId: string): Promise<ClaimBonusResponseDto> {
    const userBonuses = await this.bonusesRepo.getUserBonus(id, userId);
    if (userBonuses.length) {
      throw new BadRequestException(`bonuses.already_claim_bonus`);
    }
    const savedBonus = await this.bonusesRepo.addUserBonus(id, userId);
    this.eventEmitter.emit(
      BonusesEvent.BONUS_CLAIMED,
      new BonusClaimedEvent(savedBonus),
    );
    return savedBonus;
  }

  hasValidMembershipStage(
    userMembershipStages: UserMembershipStage[],
    membershipStageId: string,
  ): boolean {
    const hasMembershiStage = userMembershipStages
      .map((stage) => stage.membership_stage_id)
      .find((id) => id == membershipStageId);
    return hasMembershiStage !== undefined;
  }

  async getCheckinBonus(
    query: GetCheckinBonusQuery,
  ): Promise<GetCheckinBonusResponse> {
    const { userId } = query;
    const [userMembershipStages, sessions, bonuses] = await Promise.all([
      this.bonusesRepo.getUserMembershipStages(userId),
      this.bonusesRepo.getUserScheduleSessionsCount(userId, true),
      this.bonusesRepo.getBonusesWithStatus(userId, BonusType.CHECK_IN),
    ]);
    const nextBonus = bonuses.find((bonus) => !bonus.is_claimed);
    if (!nextBonus) {
      return {
        message: this.translationService.translate(
          `bonuses.checkin_bonus_claimed`,
        ),
      };
    }

    const hasMembershiStage = this.hasValidMembershipStage(
      userMembershipStages,
      nextBonus.membership_stage_id,
    );
    if (!hasMembershiStage) {
      return {
        message: this.translationService.translate(
          `bonuses.not_satisfied_user_membership_stage`,
        ),
      };
    }

    const isValidCheckinsCount =
      nextBonus.number_of_check_ins_to_be_completed <= sessions;
    if (!isValidCheckinsCount) {
      const message = `${this.translationService.translate(
        'bonuses.trophies_not_satisfied',
      )}:${sessions} ${this.translationService.translate('bonuses.required')}:${
        nextBonus.number_of_check_ins_to_be_completed
      }`;
      return { message };
    }
    nextBonus.user_id = userId;
    this.eventEmitter.emit(
      BonusesEvent.BONUS_AVAILABLE,
      new BonusAvailableEvent(nextBonus),
    );

    return {
      message: `${this.translationService.translate('bonuses.new_bonus')}
      ${nextBonus.title} ${this.translationService.translate(
        'bonuses.be_claimed',
      )}`,
      data: nextBonus,
    };
  }

  async getToolkitBonus(
    query: GetToolkitBonusQuery,
  ): Promise<GetToolkitBonuseResponse> {
    const { userId } = query;
    const [userMembershipStages, sessions, bonuses] = await Promise.all([
      this.bonusesRepo.getUserMembershipStages(userId),
      this.bonusesRepo.getUserScheduleSessionsCount(userId, true),
      this.bonusesRepo.getBonusesWithStatus(userId, BonusType.TOOL_KIT),
    ]);
    const nextBonus = bonuses.find((bonus) => !bonus.is_claimed);
    if (!nextBonus) {
      return {
        message: this.translationService.translate(
          `bonuses.claim_tool_kits_bonus`,
        ),
      };
    }

    const hasMembershiStage = this.hasValidMembershipStage(
      userMembershipStages,
      nextBonus.membership_stage_id,
    );
    if (!hasMembershiStage) {
      return {
        message: this.translationService.translate(
          `not_satisfied_user_membership_stage`,
        ),
      };
    }

    const isValidCheckinsCount =
      nextBonus.number_of_tools_to_be_completed <= sessions;
    if (!isValidCheckinsCount) {
      const message = `${this.translationService.translate(
        'bonuses.trophies_not_satisfied',
      )}:${sessions} ${this.translationService.translate(
        'bonuses.trophies_not_satisfied',
      )}:${nextBonus.number_of_tools_to_be_completed}`;
      return { message };
    }
    nextBonus.user_id = userId;
    this.eventEmitter.emit(
      BonusesEvent.BONUS_AVAILABLE,
      new BonusAvailableEvent(nextBonus),
    );

    return {
      message: `${this.translationService.translate('bonuses.new_bonus')}
      ${nextBonus.title} ${this.translationService.translate(
        'bonuses.be_claimed',
      )}`,
      data: nextBonus,
    };
  }

  async getTrophyBonus(
    query: GetTrophyBonuseQuery,
  ): Promise<GetTrophyBonusResponse> {
    const { userId } = query;
    const [userMembershipStages, trophies, bonuses] = await Promise.all([
      this.bonusesRepo.getUserMembershipStages(userId),
      this.bonusesRepo.getUserAchievedTriphiesCount(userId),
      this.bonusesRepo.getBonusesWithStatus(userId, BonusType.TROPHY),
    ]);
    const nextBonus = bonuses.find((bonus) => !bonus.is_claimed);
    if (!nextBonus) {
      return {
        message: this.translationService.translate(
          `bonuses.claim_trophy_bonus`,
        ),
      };
    }

    const hasMembershiStage = this.hasValidMembershipStage(
      userMembershipStages,
      nextBonus.membership_stage_id,
    );
    if (!hasMembershiStage) {
      return {
        message: this.translationService.translate(
          `not_satisfied_user_membership_stage`,
        ),
      };
    }

    const isValidCheckinsCount =
      nextBonus.number_of_trophies_to_be_earned <= trophies;
    if (!isValidCheckinsCount) {
      const message = `${this.translationService.translate(
        'bonuses.trophies_not_satisfied',
      )}:${trophies} ${this.translationService.translate('bonuses.required')}:${
        nextBonus.number_of_trophies_to_be_earned
      }`;
      return { message };
    }
    nextBonus.user_id = userId;
    this.eventEmitter.emit(
      BonusesEvent.BONUS_AVAILABLE,
      new BonusAvailableEvent(nextBonus),
    );

    return {
      message: `${this.translationService.translate('bonuses.new_bonus')} ${
        nextBonus.title
      } ${this.translationService.translate('bonuses.be_claimed')}`,
      data: nextBonus,
    };
  }

  async claimBonusNew(id: string, userId: string): Promise<UserBonusClaimed> {
    const userBonuses = await this.bonusesRepo.getUserBonus(id, userId);
    if (userBonuses.length) {
      throw new BadRequestException(`bonuses.already_claim_bonus`);
    }
    const savedBonus = await this.bonusesRepo.addUserBonus(id, userId);
    this.eventEmitter.emit(
      BonusesEvent.BONUS_CLAIMED,
      new BonusClaimedEvent(savedBonus),
    );
    return savedBonus;
  }

  async getBonusesNew(
    userId: string,
    lang?: string,
  ): Promise<{ bonuses: GetBonusesWithMembership[] }> {
    const bonuses = await this.bonusesRepo.getBonusesWithStatusAndTotal(userId);
    const finalBonuses = bonuses.map((bonus) => {
      const [translatedBonus] =
        this.translationService.getTranslations<Bonuses>(
          [bonus],
          ['title', 'short_description'],
          lang,
        );
      const [translatedMembershipStage] =
        this.translationService.getTranslations<MembershipStage>(
          [bonus.membership_stage],
          ['title'],
          lang,
        );
      let is_condition_satisfied = false;
      let progressPercentage = 0;
      let requiredTotal = 0;
      const { total: currentTotal } = bonus;
      const { has_membership_stage: hasMembershiStage } = bonus;
      if (bonus.bonus_type === BonusType.CHECK_IN) {
        requiredTotal = bonus.number_of_check_ins_to_be_completed;
      }
      if (bonus.bonus_type === BonusType.TOOL_KIT) {
        requiredTotal = bonus.number_of_tools_to_be_completed;
      }
      if (bonus.bonus_type === BonusType.TROPHY) {
        requiredTotal = bonus.number_of_trophies_to_be_earned;
      }
      const hasRequiredTotal = currentTotal >= requiredTotal;
      is_condition_satisfied = hasRequiredTotal;
      progressPercentage = (currentTotal / requiredTotal) * 100;
      const canClaim = is_condition_satisfied && hasMembershiStage;
      // make use progress percentage always <= 100
      progressPercentage =
        progressPercentage > 100
          ? 100
          : Math.abs(Math.floor(progressPercentage));
      return {
        ...translatedBonus,
        membership_stage: translatedMembershipStage,
        is_claimed: bonus.is_claimed,
        total: bonus.total,
        has_membership_stage: bonus.has_membership_stage,
        can_claim: canClaim,
        progress_percentage: progressPercentage,
      };
    });
    return { bonuses: finalBonuses };
  }
}
