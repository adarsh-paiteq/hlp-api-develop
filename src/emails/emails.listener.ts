import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  UserSignedUpEvent,
  UserEvent,
  ShopItemPaymentSucceededEvent,
  FriendFollowedEvent,
} from '../users/user.event';
import {
  ServiceOfferPurchasedEevent,
  ServiceOfferPurchasesEvent,
} from '../service-offer-purchases/service-offer-purchases.event';
import {
  EmailsEvent,
  ForgetPasswordEvent,
  ForgetPinEvent,
  InactivityRefresherEmailEvent,
  VerifyEmailEvent,
} from './emails.event';
import { EmailsRepo } from './emails.repo';
import {
  ScheduleEvent,
  SendAgendaReminderEvent,
  SendUserToolkitReminderEvent,
} from '../schedules/schedule.event';
import {
  TrophiesAchievedEvent,
  TrophiesEvent,
} from '../trophies/trophies.events';
import {
  ChannelPostDisabledByAdminEvent,
  ChannelsEvent,
} from '../channels/channels.event';
import { ActionClaimedEvent, ActionsEvent } from '../actions/actions.event';
import {
  DefaultTimelineMessageAddedEvent,
  ToolkitTimelineMessageAddedEvent,
  TreatmentTimelineAddedEvent,
  TreatmentTimelineEvent,
} from '@treatment-timeline/treatment-timeline.event';
import { EmailsQueue } from './emails.queue';
import { EmailsService } from './emails.service';
import {
  TreatmentClosedEvent,
  TreatmentFileAttachedEvent,
  TreatmentTeamBuddyAddedEvent,
  TreatmentsEvent,
} from '@treatments/treatments.event';
import { OauthEvent, OauthUserAddedEvent } from '@oauth/oauth.event';
import { GroupMemberAddedEvent, GroupsEvent } from '@groups/groups.events';

@Injectable()
export class EmailsListener {
  private readonly logger = new Logger(EmailsListener.name);
  constructor(
    private readonly emailsQueue: EmailsQueue,
    private readonly emailsService: EmailsService,
    private readonly emailsRepo: EmailsRepo,
  ) {}

  @OnEvent(EmailsEvent.FORGET_PASSWORD)
  async handleForgotPasswordEvent(payload: ForgetPasswordEvent): Promise<void> {
    const { user, shortLink } = payload;
    await this.emailsService.sendForgotPassword(user.id, shortLink);
  }

  @OnEvent(EmailsEvent.FORGET_PIN)
  async handleForgotPinEvent(payload: ForgetPinEvent): Promise<void> {
    const { user, shortLink } = payload;
    await this.emailsService.sendForgetPin(user, shortLink);
  }

  @OnEvent(EmailsEvent.VERIFY_EMAIL)
  async handleVerifyEmailEvent(payload: VerifyEmailEvent): Promise<void> {
    const {
      user: { user_name, email },
      shortLink,
    } = payload;
    await this.emailsService.sendVerifyEmail(email, user_name, shortLink);
  }

  @OnEvent(ServiceOfferPurchasesEvent.SERVICE_OFFER_PURCHASED)
  async handleServiceOfferPurchaseEvent(
    payload: ServiceOfferPurchasedEevent,
  ): Promise<void> {
    const {
      serviceOfferPurchase: { user_id, coupon_code },
    } = payload;
    const { email, user_name } = await this.emailsRepo.getUserById(user_id);

    await this.emailsService.sendVoucherEmail(email, user_name, coupon_code);
  }

  @OnEvent(UserEvent.USER_SIGNED_UP)
  async handleUserSignedUpEvent(payload: UserSignedUpEvent): Promise<void> {
    const { user } = payload;
    await this.emailsService.addIntroductionVideoEmailJobs(user.email);
  }

  @OnEvent(EmailsEvent.INACTIVITY_REFRESHER_EMAIL)
  async handleInactivityRefresherEmailEvent(
    payload: InactivityRefresherEmailEvent,
  ): Promise<void> {
    const { userId } = payload;
    await this.emailsQueue.addInactivityRefresher(userId);
  }

  @OnEvent(ScheduleEvent.SEND_AGENDA_REMINDER)
  async handleSendAgendaReminderEvent(
    payload: SendAgendaReminderEvent,
  ): Promise<void> {
    const { scheduleReminder, agenda } = payload;
    await this.emailsQueue.addAgendaReminderEmail(scheduleReminder, agenda);
  }

  @OnEvent(UserEvent.SHOP_ITEM_PURCHASED)
  async shopItemPaymentSucceeded(
    payload: ShopItemPaymentSucceededEvent,
  ): Promise<void> {
    const { purchasedShopItemData } = payload;
    await this.emailsQueue.addShopItemPurchaseEmail(purchasedShopItemData);
  }

  @OnEvent(TrophiesEvent.TROPHIES_ACHIVED)
  async handleTrophiesAchievedEvent(
    payload: TrophiesAchievedEvent,
  ): Promise<void> {
    await this.emailsQueue.addTrophyAchivedEmail(payload.userTrophy);
  }

  @OnEvent(ChannelsEvent.CHANNEL_POST_DISABLED_BY_ADMIN)
  async handleChannelPostDisabledByAdminEvent(
    payload: ChannelPostDisabledByAdminEvent,
  ): Promise<void> {
    const { userId } = payload;
    await this.emailsQueue.addChannelPostDisabledByAdminEmail(userId);
  }

  @OnEvent(ActionsEvent.ACTION_CLAIMED)
  async actionClaimed(payload: ActionClaimedEvent): Promise<void> {
    const { userAction } = payload;
    await this.emailsQueue.addActionClaimedEmail(userAction);
  }

  @OnEvent(TreatmentTimelineEvent.APPOINTMENT_ADDED_IN_TREATMENT_TIMELINE)
  async handleAppointmentAddedEvent(
    payload: TreatmentTimelineAddedEvent,
  ): Promise<void> {
    const { treatmentTimeline } = payload;
    await this.emailsQueue.sendAppointmentAddedEmailJob(treatmentTimeline);
  }

  @OnEvent(TreatmentTimelineEvent.TOOL_KIT_TIMELINE_MESSAGE_ADDED)
  async handleToolkitTimelineMessageAddedEvent(
    payload: ToolkitTimelineMessageAddedEvent,
  ): Promise<void> {
    const { data } = payload;
    await this.emailsQueue.sendToolkitTimelineMessageAddedEmailJob(data);
  }

  @OnEvent(TreatmentTimelineEvent.FORM_ADDED_IN_TREATMENT_TIMELINE)
  async handleFormAddedEvent(
    payload: TreatmentTimelineAddedEvent,
  ): Promise<void> {
    const { treatmentTimeline } = payload;
    await this.emailsQueue.sendFormAddedEmailJob(treatmentTimeline);
  }

  @OnEvent(TreatmentTimelineEvent.DEFAULT_TIMELINE_MESSAGE_ADDED)
  async handleDefaultTimelineMessageAddedEvent(
    payload: DefaultTimelineMessageAddedEvent,
  ): Promise<void> {
    const { data } = payload;
    await this.emailsQueue.sendDefaultTimelineMessageAddedEmailJob(data);
  }

  @OnEvent(TreatmentsEvent.TREATMENT_CLOSED)
  async handleTreatmentClosedEvent(
    payload: TreatmentClosedEvent,
  ): Promise<void> {
    const { treatment } = payload;
    await this.emailsQueue.sendTreatmentClosedEmailJob(treatment);
  }

  @OnEvent(OauthEvent.OAUTH_USER_ADDED)
  async handleOauthUserAddedEvent(payload: OauthUserAddedEvent): Promise<void> {
    const { oauthUser } = payload;
    await this.emailsQueue.sendUserActivationCodeEmail(oauthUser);
  }

  @OnEvent(TreatmentsEvent.TREATMENT_TEAM_BUDDY_ADDED)
  async handleTreatmentTeamBuddyAddedEvent(
    payload: TreatmentTeamBuddyAddedEvent,
  ): Promise<void> {
    const { treatmentBuddy } = payload;
    await this.emailsQueue.sendBuddyTreatmentEmail(treatmentBuddy);
  }

  @OnEvent(TreatmentsEvent.TREATMENT_FILE_ATTACHED)
  async handleTreatementFileAttachedEvent(
    payload: TreatmentFileAttachedEvent,
  ): Promise<void> {
    await this.emailsQueue.sendTreatementFileAttachedEvent(payload);
  }

  @OnEvent(GroupsEvent.GROUP_MEMBER_ADDED)
  async handleGroupMemberAddedEvent(
    payload: GroupMemberAddedEvent,
  ): Promise<void> {
    await this.emailsQueue.addGroupMemberAddedEmailJob(payload);
  }
  @OnEvent(ScheduleEvent.SEND_USER_TOOLKIT_REMINDER)
  async handleUserToolkitReminderEvent(
    payload: SendUserToolkitReminderEvent,
  ): Promise<void> {
    await this.emailsQueue.addUserToolkitReminderEmail(payload);
  }

  @OnEvent(UserEvent.FRIEND_FOLLOWED)
  async handleFriendFollowedEvent(payload: FriendFollowedEvent): Promise<void> {
    await this.emailsQueue.sendFriendFollowedEmail(payload);
  }
}
