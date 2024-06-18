import { BullModule, BullModuleOptions, InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';
import { defaultJobOptions } from '@core/configs/bull.config';
import { UserMembershipLevel } from '../membership-levels/membership-levels.dto';
import { UserMembershipStage } from '../membership-stages/entities/user-membership-stages.entity';
import {
  HLPPointsDonatedToCampaignEvent,
  ReduceUserHlpPointsEvent,
} from './user.event';
import { ShopitemPurchase, UserReminderTone } from './users.dto';
export const USERS_QUEUE = 'users';
export const UsersQueueConfig: BullModuleOptions = {
  name: USERS_QUEUE,
  defaultJobOptions: defaultJobOptions,
};
export enum UsersJob {
  ADD_HLP_POINTS = '[USER] ADD_HLP_POINTS',
  REDUCE_HLP_POINTS = '[USER] REDUCE_HLP_POINTS',
  UPDATE_MEMBERSHIP_STAGE_ID = '[USER] UPDATE MEMBERSHIP ID',
  UPDATE_MEMBERSHIP_LEVEL_ID = '[USER] UPDATE MEMBERSHIP LEVEL ID',
  REDUCE_HLP_POINTS_FOR_REMINDER_TONE_PURCHASE = '[USER] REDUCE HLP POINTS FOR REMINDER TONE PURCHASE',
  REDUCE_HLP_POINTS_FOR_SHOP_ITEM_PURCHASE = '[USER] REDUCE HLP POINTS FOR SHOP ITEM PURCHASE',
  REDUCE_HLP_POINTS_FOR_DONATION = '[USER] REDUCE HLP POINTS FOR DONATION',
  REDUCE_HLP_POINTS_FOR_CAMPAIGN_DONATION = '[USER] REDUCE HLP POINTS FOR CAMPAIGN DONATION',
  ADD_OR_UPDATE_USER_TO_MAILCHIMP_LIST = '[USER] ADD OR UPDATE USER TO MAILCHIMP LIST',
}

export const registerUsersQueue =
  BullModule.registerQueueAsync(UsersQueueConfig);

@Injectable()
export class UsersQueue {
  private logger = new Logger('[QUEUE]');
  constructor(@InjectQueue(USERS_QUEUE) private readonly usersQueue: Queue) {}

  async addRewardPoints(userId: string, points: number): Promise<void> {
    await this.usersQueue.add(UsersJob.ADD_HLP_POINTS, { userId, points });
  }

  async updateMembershipStage(
    membershipStage: UserMembershipStage,
  ): Promise<void> {
    await this.usersQueue.add(
      UsersJob.UPDATE_MEMBERSHIP_STAGE_ID,
      membershipStage,
    );
  }

  async updateMembershipLevel(
    membershipLevel: UserMembershipLevel,
  ): Promise<void> {
    await this.usersQueue.add(
      UsersJob.UPDATE_MEMBERSHIP_LEVEL_ID,
      membershipLevel,
    );
  }

  async reducePointsForReminderTonePurchase(
    reminderTone: UserReminderTone,
  ): Promise<void> {
    await this.usersQueue.add(
      UsersJob.REDUCE_HLP_POINTS_FOR_REMINDER_TONE_PURCHASE,
      reminderTone,
    );
  }

  async reducePointsForShopItemPurchase(
    purchasedItem: ShopitemPurchase,
  ): Promise<void> {
    await this.usersQueue.add(
      UsersJob.REDUCE_HLP_POINTS_FOR_SHOP_ITEM_PURCHASE,
      purchasedItem,
    );
  }

  async reducePointsForCampaignDonation(
    payload: HLPPointsDonatedToCampaignEvent,
  ): Promise<void> {
    await this.usersQueue.add(
      UsersJob.REDUCE_HLP_POINTS_FOR_CAMPAIGN_DONATION,
      payload,
    );
  }

  async reduceHlpPoint(payload: ReduceUserHlpPointsEvent): Promise<void> {
    await this.usersQueue.add(UsersJob.REDUCE_HLP_POINTS, payload);
  }

  async addOrUpdateUserToMailchimpListJob(userId: string): Promise<void> {
    await this.usersQueue.add(UsersJob.ADD_OR_UPDATE_USER_TO_MAILCHIMP_LIST, {
      userId,
    });
  }
}
