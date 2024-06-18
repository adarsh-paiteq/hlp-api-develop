import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  GetNextMembershipStageDto,
  MembershipStage,
  MembershipStageCheck,
  SaveUserMembershipStageDto,
} from './membership-stages.dto';
import { MembershipStagesRepo } from './membership-stages.repo';
import * as datefns from 'date-fns';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  MembershipStageSavedEvent,
  MembershipStagesEvent,
} from './membership-stages.event';
import { User, UserDonation } from '../users/users.dto';
import { UserMembershipStage } from './entities/user-membership-stages.entity';
import { TranslationService } from '@shared/services/translation/translation.service';
@Injectable()
export class MembershipStagesService {
  private readonly logger = new Logger(MembershipStagesService.name);
  constructor(
    private readonly stagesRepo: MembershipStagesRepo,
    private readonly eventEmitter: EventEmitter2,
    private readonly translationService: TranslationService,
  ) {}

  private addDefaultCheckList(
    status = false,
    stage: MembershipStage,
    lang?: string,
  ): MembershipStageCheck[] {
    const translatedTitleArray =
      this.translationService.getTranslations<MembershipStage>(
        [stage],
        ['title'],
        lang,
      );
    const translatedTitle = translatedTitleArray[0]?.title;
    const checkList: MembershipStageCheck[] = [
      {
        is_completed: status,
        name: `${
          stage.hlp_reward_points_to_unlock_this_stage
        }  ${this.translationService.translate(`membership_stage.hlp`)};`,
      },
      {
        is_completed: status,
        name: `${stage.number_of_donations} ${this.translationService.translate(
          `membership_stage.thanks_recived`,
        )}`,
      },
      {
        is_completed: status,
        name: `${stage.account_duration} ${this.translationService.translate(
          `membership_stage.months_member`,
        )}`,
      },
      {
        is_completed: status,
        name: translatedTitle,
      },
    ];
    return checkList;
  }

  private mapUserStagesWithMembershipStages(
    membershipStages: MembershipStage[],
    lang?: string,
  ): MembershipStage[] {
    const stages = membershipStages.map((stage) => {
      const isCompleted = stage.is_completed;
      const ProgressPercentage = isCompleted ? 100 : 0;
      const checkList = this.addDefaultCheckList(isCompleted, stage, lang);
      return {
        ...stage,
        progress_percentage: ProgressPercentage,
        check_list: checkList,
      };
    });
    return stages;
  }

  private isStageCompleted(
    stage: MembershipStage,
    completedStagesTotalPoints: number,
    points: number,
    userDonations: number,
    user: User,
  ): boolean {
    const hasPoints =
      stage.hlp_reward_points_to_unlock_this_stage +
        completedStagesTotalPoints <=
      points;
    const hasDonations = userDonations >= stage.number_of_donations;
    const durationInMonths = datefns.differenceInMonths(
      new Date(),
      new Date(user.created_at as string),
    );
    const hasMembershipLevel = stage.has_membership_level;
    const membershipLevel = hasMembershipLevel !== undefined;
    this.logger.log(
      `Points:${points}, donation:${userDonations}, duration:${durationInMonths},membership_level ${hasMembershipLevel}: ${stage.title}`,
    );
    const validDuration = durationInMonths >= stage.account_duration;
    return (
      !stage.is_completed &&
      hasPoints &&
      hasDonations &&
      validDuration &&
      membershipLevel
    );
  }

  async getNextMembershipStage(
    body: GetNextMembershipStageDto,
    lang?: string,
  ): Promise<MembershipStage | undefined> {
    const { userId, points } = body;
    const [membershipStages, user_donations_count, user] = await Promise.all([
      this.stagesRepo.getMembershipStagesWithStatus(userId),
      this.stagesRepo.getUserDonationsCount(userId),
      this.stagesRepo.getUser(userId),
    ]);
    if (!membershipStages.length) {
      this.logger.warn(`No stages available`);
      return;
    }
    const stages = this.mapUserStagesWithMembershipStages(
      membershipStages,
      lang,
    );
    const completedStagesTotalPoints = stages
      .filter((stage) => stage.is_completed)
      .reduce(
        (a, stage) => a + stage.hlp_reward_points_to_unlock_this_stage,
        0,
      );
    const nextStage = stages.find((stage) =>
      this.isStageCompleted(
        stage,
        completedStagesTotalPoints,
        points,
        user_donations_count,
        user,
      ),
    );
    if (!nextStage) {
      return;
    }
    return nextStage;
  }

  private async saveUserMembershipStage(
    userId: string,
    membershipStage: MembershipStage,
  ): Promise<UserMembershipStage> {
    const userMembershipStage: SaveUserMembershipStageDto = {
      user_id: userId,
      membership_stage_id: membershipStage.id,
    };
    return this.stagesRepo.saveUserMembershipStage(userMembershipStage);
  }

  async checkMembershipStage(body: GetNextMembershipStageDto): Promise<string> {
    const nextStage = await this.getNextMembershipStage(body);
    const { userId, points } = body;
    if (!nextStage) {
      const message = `No Matched Stage  found for hlp points  ${points}`;
      this.logger.log(message);
      return message;
    }
    const isAlreadyReached = await this.stagesRepo.getUserMembershipStage(
      userId,
      nextStage.id,
    );
    if (isAlreadyReached) {
      const message = `${nextStage.title} already reached`;
      this.logger.warn(message);
      return message;
    }
    const savedMembership = await this.saveUserMembershipStage(
      userId,
      nextStage,
    );
    this.eventEmitter.emit(
      MembershipStagesEvent.MEMBERSHIP_STAGE_SAVED,
      new MembershipStageSavedEvent(savedMembership),
    );
    const message = `${userId} user reached new membership stage ${savedMembership.membership_stage_id}(${nextStage.title})`;
    this.logger.log(message);
    return message;
  }

  private calculateProgress(
    stage: MembershipStage,
    completedStagesTotalPoints: number,
    points: number,
    userDonations: number,
    user: User,
    lang?: string,
  ): { progress: number; checkList: MembershipStageCheck[] } {
    const totalPercentage = 100;
    let progress = 0;
    const constraints = 4;
    const constraintPercentage = totalPercentage / constraints;
    const checkList: MembershipStageCheck[] = [];

    // reward points
    const requiredPoints =
      stage.hlp_reward_points_to_unlock_this_stage + completedStagesTotalPoints;
    const hasPoints = requiredPoints <= points;
    if (hasPoints) {
      progress += constraintPercentage;
    }
    const hlp = this.translationService.translate(`membership_stage.hlp`);
    checkList.push({
      is_completed: hasPoints,
      name: `${stage.hlp_reward_points_to_unlock_this_stage} ${hlp}`,
    });

    // donations
    const hasDonations = userDonations >= stage.number_of_donations;
    if (hasDonations) {
      progress += constraintPercentage;
    }
    const people = this.translationService.translate(
      `membership_stage.thanks_recived`,
    );
    checkList.push({
      is_completed: hasDonations,
      name: `${stage.number_of_donations} ${people}`,
    });

    // durauion
    const durationInMonths = datefns.differenceInMonths(
      new Date(),
      new Date(user.created_at as string),
    );
    const validDuration = durationInMonths >= stage.account_duration;
    if (validDuration) {
      progress += constraintPercentage;
    }
    const body = this.translationService.translate(
      `membership_stage.months_member`,
    );
    checkList.push({
      is_completed: validDuration,
      name: `${stage.account_duration} ${body}`,
    });

    const hasMembershipLevel = stage.has_membership_level;
    if (hasMembershipLevel) {
      progress += constraintPercentage;
    }
    const translatedTitleArray =
      this.translationService.getTranslations<MembershipStage>(
        [stage],
        ['title'],
        lang,
      );
    const translatedTitle = translatedTitleArray[0]?.title;
    checkList.push({
      is_completed: hasMembershipLevel,
      name: translatedTitle,
    });

    this.logger.log(
      `Points:${points}, donation:${userDonations}, duration:${durationInMonths},membership_level ${hasMembershipLevel}: ${stage.title} ${progress}`,
    );
    progress = progress > 100 ? 100 : Math.abs(Math.floor(progress));
    return { progress, checkList };
  }

  async getUserMembershipStagesSummary(
    body: GetNextMembershipStageDto,
    lang?: string,
  ): Promise<MembershipStage[]> {
    const { userId, points } = body;
    const [membershipStages, user_donations_count, user] = await Promise.all([
      this.stagesRepo.getMembershipStagesWithStatus(userId),
      this.stagesRepo.getUserDonationsCount(userId),
      this.stagesRepo.getUser(userId),
    ]);
    if (!membershipStages.length) {
      this.logger.warn(`No stages available`);
      return [];
    }
    const stages = this.mapUserStagesWithMembershipStages(
      membershipStages,
      lang,
    );
    const translatedMemebershipStage =
      this.translationService.getTranslations<MembershipStage>(
        stages,
        ['title', 'description'],
        lang,
      );
    const completedStagesTotalPoints = stages
      .filter((stage) => stage.is_completed)
      .reduce(
        (a, stage) => a + stage.hlp_reward_points_to_unlock_this_stage,
        0,
      );
    const nextStage = stages.find((stage) => !stage.is_completed);
    const nextStageIndex = stages.findIndex((stage) => !stage.is_completed);
    if (!nextStage) {
      return stages;
    }
    const nextStageProgress = this.calculateProgress(
      nextStage,
      completedStagesTotalPoints,
      points,
      user_donations_count,
      user,
      lang,
    );
    stages[nextStageIndex].progress_percentage = nextStageProgress.progress;
    stages[nextStageIndex].check_list = nextStageProgress.checkList;
    return translatedMemebershipStage;
  }

  async handleHlpDonated(donation: UserDonation): Promise<string> {
    const { donor_user_id: userId } = donation;
    const user = await this.stagesRepo.getUser(userId);
    if (!user) {
      const message = `${userId} user not found`;
      this.logger.warn(message);
      return message;
    }
    const points = user.hlp_reward_points_balance as number;
    return this.checkMembershipStage({ userId, points });
  }

  /**
   * @description this is testing api
   */
  async getMembershipStagesSummary(userId: string) {
    const user = await this.stagesRepo.getUser(userId);
    if (!user) {
      throw new NotFoundException(`membership-stages.user_not_found`);
    }
    return this.getUserMembershipStagesSummary({
      userId,
      points: user.hlp_reward_points_balance as number,
    });
  }
}
