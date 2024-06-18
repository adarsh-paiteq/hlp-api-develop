import { defaultWorkersConcurrency } from '@core/configs/bull.config';
import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import Bull from 'bull';
import { ProcessorLogger } from '../core/helpers/processor-logging.helper';
import { UserMembershipLevel } from '../membership-levels/membership-levels.dto';
import { UserMembershipStage } from '../membership-stages/entities/user-membership-stages.entity';
import {
  HLPPointsDonatedToCampaignEvent,
  PointsAddedEvent,
  ReduceUserHlpPointsEvent,
  UserEvent,
} from './user.event';
import { ShopitemPurchase, UserReminderTone } from './users.dto';
import { UsersJob, USERS_QUEUE } from './users.queue';
import { UsersRepo } from './users.repo';
import { UsersService } from './users.service';
import { AddOrUpdateUserToMailchimpListResponse } from '@shared/services/mailchimp/dto/mailchimp.dto';

@Processor(USERS_QUEUE)
export class UsersProcessor extends ProcessorLogger {
  readonly logger = new Logger(UsersProcessor.name);
  constructor(
    private readonly userRepo: UsersRepo,
    private readonly eventEmitter: EventEmitter2,
    private readonly userService: UsersService,
  ) {
    super();
  }

  @Process({
    name: UsersJob.ADD_HLP_POINTS,
    concurrency: defaultWorkersConcurrency,
  })
  async addRewardPoints(
    job: Bull.Job<{ userId: string; points: number }>,
  ): Promise<string> {
    try {
      const {
        data: { userId, points },
      } = job;
      const response = await this.userRepo.addHlpPoints(points, userId);
      this.eventEmitter.emit(
        UserEvent.POINTS_ADDED,
        new PointsAddedEvent(userId, response.hlp_reward_points_balance),
      );
      this.logger.log(
        `${response.user_name} reward points are ${response.hlp_reward_points_balance}`,
      );
      return 'OK';
    } catch (error) {
      this.logger.error(`${this.addRewardPoints.name}:${error.stack}`);
      throw error;
    }
  }

  @Process({
    name: UsersJob.UPDATE_MEMBERSHIP_STAGE_ID,
    concurrency: defaultWorkersConcurrency,
  })
  async updateMembershipStage(
    job: Bull.Job<UserMembershipStage>,
  ): Promise<string> {
    try {
      const { data: userMembershipStage } = job;
      const { user_id, membership_stage_id } = userMembershipStage;
      await this.userRepo.updateUserById(user_id, {
        current_membership_stage_id: membership_stage_id,
      });
      return 'OK';
    } catch (error) {
      this.logger.error(`${this.updateMembershipStage.name}:${error.stack}`);
      throw error;
    }
  }

  @Process({
    name: UsersJob.UPDATE_MEMBERSHIP_LEVEL_ID,
    concurrency: defaultWorkersConcurrency,
  })
  async updateMembershipLevel(
    job: Bull.Job<UserMembershipLevel>,
  ): Promise<string> {
    try {
      const { data: userMembershipStage } = job;
      const { user_id, membership_level_id } = userMembershipStage;
      await this.userRepo.updateUserById(user_id, {
        current_membership_level_id: membership_level_id,
      });
      return 'OK';
    } catch (error) {
      this.logger.error(`${this.updateMembershipLevel.name}:${error.stack}`);
      throw error;
    }
  }

  @Process({
    name: UsersJob.REDUCE_HLP_POINTS_FOR_REMINDER_TONE_PURCHASE,
    concurrency: defaultWorkersConcurrency,
  })
  async reducePointsForReminderTonePurchase(
    job: Bull.Job<UserReminderTone>,
  ): Promise<string> {
    try {
      const { data: userReminderTone } = job;
      await this.userService.reducePointsForReminderTonePurchase(
        userReminderTone,
      );
      return 'OK';
    } catch (error) {
      this.logger.error(
        `${this.reducePointsForReminderTonePurchase.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: UsersJob.REDUCE_HLP_POINTS_FOR_SHOP_ITEM_PURCHASE,
    concurrency: defaultWorkersConcurrency,
  })
  async reducePointsForShopItemPurchase(
    job: Bull.Job<ShopitemPurchase>,
  ): Promise<string> {
    try {
      const { data: purchasedItem } = job;
      const message = `reduce the hlp_reward_points for shop item purchase. userId ${purchasedItem.user_id}`;
      await job.log(message);
      await this.userService.reducePointsForShopItemPurchase(purchasedItem);
      return message;
    } catch (error) {
      this.logger.error(
        `${this.reducePointsForShopItemPurchase.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: UsersJob.REDUCE_HLP_POINTS_FOR_CAMPAIGN_DONATION,
    concurrency: defaultWorkersConcurrency,
  })
  async reducePointsForCampaignDonation(
    job: Bull.Job<HLPPointsDonatedToCampaignEvent>,
  ): Promise<string> {
    try {
      const { data } = job;
      const message = `reduce the hlp_reward_points ${data.points} userId ${data.userId} for campaign donation`;
      await job.log(message);
      await this.userService.reduceDonatedPointsForCampaign(data);
      return message;
    } catch (error) {
      this.logger.error(
        `${this.reducePointsForCampaignDonation.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: UsersJob.REDUCE_HLP_POINTS,
    concurrency: defaultWorkersConcurrency,
  })
  async reduceHlpPoints(
    job: Bull.Job<ReduceUserHlpPointsEvent>,
  ): Promise<string> {
    const { data } = job;
    await job.log(data.note);
    const result = await this.userService.reduceHlpPoints(data);
    return result;
  }

  @Process({
    name: UsersJob.ADD_OR_UPDATE_USER_TO_MAILCHIMP_LIST,
    concurrency: defaultWorkersConcurrency,
  })
  async handleAddOrUpdateUserToMailchimpListJob(
    job: Bull.Job<{ userId: string }>,
  ): Promise<AddOrUpdateUserToMailchimpListResponse> {
    try {
      const { userId } = job.data;
      return await this.userService.addOrUpdateUserToMailchimpList(userId);
    } catch (error) {
      this.logger.error(
        `${this.handleAddOrUpdateUserToMailchimpListJob.name}:${error.stack}`,
      );
      throw error;
    }
  }
}
