import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RewardsRepo } from '../rewards/rewards.repo';
import {
  UserTrophy,
  CheckTrophies,
  SaveUserTrophy,
  Trophy,
  TrophyField,
  trophyFieldsTable,
  TrophyType,
} from './trophies.dto';
import { TrophiesAchievedEvent, TrophiesEvent } from './trophies.events';
import TrophiesRepo from './trophies.repo';
import { Channel } from '@channels/entities/channel.entity';

@Injectable()
export class TrophiesService {
  private readonly logger = new Logger(TrophiesService.name);

  constructor(
    private readonly trophiesRepo: TrophiesRepo,
    private readonly eventEmitter: EventEmitter2,
    private readonly rewardsRepo: RewardsRepo,
  ) {}

  /**
   * @description The service used in the @function checkIfUserHasAchievedTheTrophy() function within the trophies service.
   */
  private getTrophiesUserCanAchieve(
    trophies: Array<Trophy>,
    userTrophies: Array<Trophy>,
    requiredType: TrophyType,
    requiredField: TrophyField,
    availablePoints: number,
  ): Array<Trophy> {
    const filteredTrophies = trophies
      .filter((trophy) => {
        return trophy.trophy_type === requiredType;
      })
      .sort((a, b) => a[requiredField] - b[requiredField]);
    this.logger.log(`Total ${requiredField} for this user: ${availablePoints}`);
    let sum = 0;
    const trophiesUserCanAchieve: Array<Trophy> = [];
    for (const trophy of filteredTrophies) {
      sum += trophy[requiredField];
      if (sum <= availablePoints) trophiesUserCanAchieve.push(trophy);
    }
    const filterUserTrophies = userTrophies.filter(
      (trophy) => trophy.trophy_type === requiredType,
    );
    const duplicateFreeUserTrophies = filterUserTrophies.filter(
      (v, i, a) => a.findIndex((v2) => v2.id === v.id) === i,
    );
    if (!duplicateFreeUserTrophies.length) {
      return trophiesUserCanAchieve;
    }
    const arr = trophiesUserCanAchieve
      .filter((trophy1) =>
        duplicateFreeUserTrophies.every((trophy2) => trophy2.id !== trophy1.id),
      )
      .sort((a, b) => a[requiredField] - b[requiredField]);
    if (!arr) return [];
    return arr;
  }

  /**
   * @description The service used in the @function getTrophiesAchieved() function within the trophies controller.
   */
  public async checkIfUserHasAchievedTheTropphy(
    userId: string,
    trophy_type: TrophyType,
  ): Promise<Trophy | undefined> {
    const res = await this.trophiesRepo.getTrophiesAndTrophiesUserAchieved(
      userId,
    );
    const { trophies, user_trophies: trophies_user_achieved } = res;
    let noOfRequiredFields;
    let achivedTrophies;
    const trophiesWithSameLogic = [
      TrophyType.HLP_EARNED,
      TrophyType.STREAK,
      TrophyType.TOOLS_DONE,
      TrophyType.CHALLENGES_DONE,
      TrophyType.LEVEL,
      TrophyType.REACTIONS_ADDED,
      TrophyType.POSTS_ADDED,
      TrophyType.CHECK_INS_DONE,
      TrophyType.FRIENDS_FOLLOW,
      TrophyType.MEDITATION_TOOLS_DONE,
      TrophyType.GOAL,
    ];
    if (trophiesWithSameLogic.includes(trophy_type)) {
      noOfRequiredFields = await this.trophiesRepo.getNumberOfRequiredFields(
        userId,
        trophy_type,
      );
      achivedTrophies = this.getTrophiesUserCanAchieve(
        trophies,
        trophies_user_achieved,
        trophy_type,
        trophyFieldsTable.get(trophy_type) as TrophyField,
        noOfRequiredFields,
      );
    } else if (trophy_type === TrophyType.HELPED) {
      noOfRequiredFields = await this.trophiesRepo.getNumberOfHelped(userId);
      achivedTrophies = this.getTrophiesUserCanAchieve(
        trophies,
        trophies_user_achieved,
        trophy_type,
        trophyFieldsTable.get(trophy_type) as TrophyField,
        noOfRequiredFields,
      );
    } else if (trophy_type === TrophyType.HLP_DONATED) {
      noOfRequiredFields = await this.trophiesRepo.getNumberOfHlpDonated(
        userId,
      );
      achivedTrophies = this.getTrophiesUserCanAchieve(
        trophies,
        trophies_user_achieved,
        trophy_type,
        trophyFieldsTable.get(trophy_type) as TrophyField,
        noOfRequiredFields,
      );
    } else if (trophy_type === TrophyType.HLP_RECIEVED) {
      noOfRequiredFields = await this.trophiesRepo.getNumberOfHlpRevieved(
        userId,
      );
      achivedTrophies = this.getTrophiesUserCanAchieve(
        trophies,
        trophies_user_achieved,
        trophy_type,
        trophyFieldsTable.get(trophy_type) as TrophyField,
        noOfRequiredFields,
      );
    } else if (trophy_type === TrophyType.CHANNEL_FOLLOW) {
      noOfRequiredFields = await this.trophiesRepo.getNumberOfChannelFollow(
        userId,
      );
      achivedTrophies = this.getTrophiesUserCanAchieve(
        trophies,
        trophies_user_achieved,
        trophy_type,
        trophyFieldsTable.get(trophy_type) as TrophyField,
        noOfRequiredFields,
      );
    } else if (trophy_type === TrophyType.ACCOUNT_DURATION) {
      noOfRequiredFields = await this.trophiesRepo.getAccountDuration(userId);
      achivedTrophies = this.getTrophiesUserCanAchieve(
        trophies,
        trophies_user_achieved,
        trophy_type,
        trophyFieldsTable.get(trophy_type) as TrophyField,
        noOfRequiredFields,
      );
    } else if (trophy_type === TrophyType.CHALLENGES_WON) {
      noOfRequiredFields = await this.trophiesRepo.getNumberOfChallengesWon(
        userId,
      );
      achivedTrophies = this.getTrophiesUserCanAchieve(
        trophies,
        trophies_user_achieved,
        trophy_type,
        trophyFieldsTable.get(trophy_type) as TrophyField,
        noOfRequiredFields,
      );
    } else {
      throw new NotFoundException('NOT_FOUND');
    }
    this.logger.log(
      `Total ${achivedTrophies.length} trophies of ${trophy_type} can be achieved by this user`,
    );
    if (!achivedTrophies.length) {
      this.logger.log(`No trophies can be achieved`);
      return;
    }
    const [achieved_trophy] = achivedTrophies;
    return achieved_trophy;
  }

  /**
   * @deprecated This code is no longer used and can be safely removed.
   */
  private mapTrophiesWithUserTrophies(
    trophies: Trophy[],
    userTrophies: UserTrophy[],
  ): Trophy[] {
    const userTrophyIds = userTrophies.map((trophy) => trophy.trophy_id);
    const trophiesWithStatus = trophies.map((trophy) => ({
      ...trophy,
      is_completed: userTrophyIds.includes(trophy.id),
    }));
    return trophiesWithStatus;
  }

  async getUserTrophiesSummary(
    userId: string,
    lang?: string,
  ): Promise<Trophy[]> {
    return this.trophiesRepo.getTrophiesWithStatus(userId, lang);
  }

  /**
   * @description The service used in the following functions: @function checkGoalLevel() in the trophies controller and @function checkTrophiesAchieved() in the trophies processor
   */
  async checkAndSaveAchievedTrophies(
    checkTrophies: CheckTrophies,
  ): Promise<{ response: string }> {
    const { user_id, trophy_type } = checkTrophies;
    try {
      const achieved_trophy = await this.checkIfUserHasAchievedTheTropphy(
        user_id,
        trophy_type,
      );
      const achievedTrophy = achieved_trophy as unknown as Trophy;
      if (!achievedTrophy) {
        return { response: `No trophy can be Achieved` };
      }

      const userTrophy: SaveUserTrophy = {
        user_id: user_id,
        trophy_id: achievedTrophy.id,
      };

      await this.trophiesRepo.sessionLock(user_id);
      const userTrophies = await this.trophiesRepo.getUserTrophy(
        user_id,
        userTrophy.trophy_id,
      );
      if (userTrophies) {
        return { response: `Trophy Already Achieved` };
      }
      const newUserTrophy = await this.trophiesRepo.saveUserTrophy(userTrophy);
      if (!newUserTrophy) {
        return { response: `failed to save user trophy` };
      }

      this.eventEmitter.emit(
        TrophiesEvent.TROPHIES_ACHIVED,
        new TrophiesAchievedEvent(newUserTrophy),
      );

      return {
        response: `User Trophy Saved: ${JSON.stringify(newUserTrophy)}`,
      };
    } catch (error) {
      throw new Error(error);
    } finally {
      await this.trophiesRepo.sessionUnlock(user_id);
    }
  }

  async getChannel(channelId: string): Promise<Channel> {
    const channel = await this.rewardsRepo.getChannelById(channelId);
    if (!channel) {
      throw new NotFoundException(`Channel Not found ${channelId}`);
    }
    return channel;
  }
}
