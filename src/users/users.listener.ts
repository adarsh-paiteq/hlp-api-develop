import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  MembershipLevelSavedEvent,
  MembershipLevelsEvent,
} from '../membership-levels/membership-levels.event';
import {
  MembershipStagesEvent,
  MembershipStageSavedEvent,
} from '../membership-stages/membership-stages.event';
import { RewardAddedEvent, RewardEvent } from '../rewards/rewards.event';
import {
  ServiceOfferPurchasedEevent,
  ServiceOfferPurchasesEvent,
} from '../service-offer-purchases/service-offer-purchases.event';
import {
  HLPPointsDonatedToCampaignEvent,
  ReminderTonePurchasedEvent,
  ShopItemPaymentSucceededEvent,
  UserEvent,
  UserSignedUpEvent,
} from './user.event';

import { UsersQueue } from './users.queue';

@Injectable()
export class UsersEventListener {
  private readonly logger = new Logger(UsersEventListener.name);
  constructor(private readonly usersQueue: UsersQueue) {}

  @OnEvent(RewardEvent.REWARD_ADDED)
  async handleRewardAddedEvent(payload: RewardAddedEvent): Promise<void> {
    this.logger.log(`RewardEvent.REWARD_ADDED`);
    const { user_id: userId, hlp_reward_points_awarded: points } =
      payload.reward;
    await this.usersQueue.addRewardPoints(userId, points);
  }

  @OnEvent(MembershipStagesEvent.MEMBERSHIP_STAGE_SAVED)
  async handleMembershipStageSavedEvent(
    payload: MembershipStageSavedEvent,
  ): Promise<void> {
    this.logger.log(
      `Update the current_membership_stage_id  ${JSON.stringify(
        payload.userMembershipStage.membership_stage_id,
      )}`,
    );
    await this.usersQueue.updateMembershipStage(payload.userMembershipStage);
  }

  @OnEvent(MembershipLevelsEvent.MEMBERSHIP_LEVEL_SAVED)
  async handleMembershipLevelSavedEvent(
    payload: MembershipLevelSavedEvent,
  ): Promise<void> {
    this.logger.log(
      `Update the current_membership_level_id  ${JSON.stringify(
        payload.userMembershipLevel.membership_level_id,
      )}`,
    );
    await this.usersQueue.updateMembershipLevel(payload.userMembershipLevel);
  }

  @OnEvent(UserEvent.REMINDER_TONE_PURCHASED)
  async handleReminderTonePurchaseEvent(
    payload: ReminderTonePurchasedEvent,
  ): Promise<void> {
    this.logger.log(payload.reminderTone);
    await this.usersQueue.reducePointsForReminderTonePurchase(
      payload.reminderTone,
    );
  }

  @OnEvent(UserEvent.SHOP_ITEM_PURCHASED)
  async shopItemPaymentSucceeded(
    payload: ShopItemPaymentSucceededEvent,
  ): Promise<void> {
    const { purchasedShopItemData } = payload;
    this.logger.log(
      `reduce the hlp_reward_points. userId ${JSON.stringify(
        purchasedShopItemData.user_id,
      )}`,
    );
    await this.usersQueue.reducePointsForShopItemPurchase(
      purchasedShopItemData,
    );
  }

  @OnEvent(UserEvent.HLP_POINTS_DONATED_TO_CAMPAIGN)
  async handleHLPPointsDonatedToCampaignEvent(
    payload: HLPPointsDonatedToCampaignEvent,
  ): Promise<void> {
    const message = `reduce the hlp_reward_points ${payload.points} userId ${payload.userId} for campaign donation`;
    this.logger.log(message);
    await this.usersQueue.reducePointsForCampaignDonation(payload);
  }

  @OnEvent(ServiceOfferPurchasesEvent.SERVICE_OFFER_PURCHASED)
  async serviceOfferPurchased(
    payload: ServiceOfferPurchasedEevent,
  ): Promise<void> {
    const { serviceOfferPurchase } = payload;
    await this.usersQueue.reduceHlpPoint({
      userId: serviceOfferPurchase.user_id,
      points: serviceOfferPurchase.hlp_points,
      note: `${serviceOfferPurchase.service_offer_id} service offer is purchased`,
    });
  }

  @OnEvent(UserEvent.USER_SIGNED_UP)
  async handleUserSignedUpEvent(payload: UserSignedUpEvent): Promise<void> {
    const { user } = payload;
    return await this.usersQueue.addOrUpdateUserToMailchimpListJob(user.id);
  }
}
