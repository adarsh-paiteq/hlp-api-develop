import { UserReward } from '../rewards/rewards.dto';
import { ServiceOfferPurchase } from '../service-offer-purchases/entities/service-offer-purchase.entity';
import { UserFriendRequest } from './entities/user-friend-request.entity';
import {
  ShopitemPurchase,
  UserDonation,
  UserFriends,
  UserReminderTone,
} from './users.dto';
import { Users } from './users.model';

export enum UserEvent {
  ADD_REWARD_POINTS = '[USER] ADD REWARDS POINTS',
  POINTS_ADDED = '[USER] POINTS ADDED',
  REMINDER_TONE_PURCHASED = '[USER] REMINDER TONE PURCHASED',
  SHOP_ITEM_PURCHASED = '[USER] SHOP ITEM PAYMENT SUCCEEDED',
  HLP_POINTS_DONATED = '[USER] HLP POINTS DONATED',
  HLP_POINTS_DONATED_TO_CAMPAIGN = '[USER] HLP POINTS DONATED TO CAMPAIGN',
  FRIEND_FOLLOWED = 'FRIEND_FOLLOWED',
  SERVICE_OFFER_PURCHASED = '[USER] SERVICE OFFER PAYMENT PURCHASED',
  USER_SIGNED_UP = '[USER] USER SIGNED UP',
  FRIEND_REQUEST_CREATED = '[USER] FRIEND_REQUEST_CREATED',
}

/**
 *@deprecated Unused code
 */
export class AddRewardPointsEvent {
  constructor(public reward: UserReward) {}
}
export class PointsAddedEvent {
  constructor(public userId: string, public points: number) {}
}

export class ReminderTonePurchasedEvent {
  constructor(public reminderTone: UserReminderTone) {}
}

export class ShopItemPaymentSucceededEvent {
  constructor(public purchasedShopItemData: ShopitemPurchase) {}
}

export class HLPPointsDonatedEvent {
  constructor(public donation: UserDonation) {}
}

export class HLPPointsDonatedToCampaignEvent {
  constructor(public userId: string, public points: number) {}
}

export class FriendFollowedEvent {
  constructor(public friendFollowed: UserFriends) {}
}

/**
 * @deprecated Unused code
 */
export class ServiceOfferPaymentSucceededEvent {
  constructor(public serviceOfferPurchaseData: ServiceOfferPurchase) {}
}

export class ReduceUserHlpPointsEvent {
  constructor(
    public userId: string,
    public points: number,
    public note: string,
  ) {}
}

export class UserSignedUpEvent {
  constructor(public user: Users) {}
}

export class FriendRequestCreatedEvent {
  constructor(public userFriendRequest: UserFriendRequest) {}
}
