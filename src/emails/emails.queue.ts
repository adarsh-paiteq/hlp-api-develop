import { defaultJobOptions } from '@core/configs/bull.config';
import { BullModule, BullModuleOptions, InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';
import { ShopitemPurchase } from '../users/users.dto';
import { AgendaReminderData } from '../notifications/notifications.model';
import { ScheduleReminder } from '../schedules/schedules.dto';
import { Toolkit } from '../toolkits/toolkits.model';
import { VideoEmailData } from './emails.dto';
import { UserTrophy } from '../trophies/trophies.dto';
import { UserAction } from '../actions/actions.dto';
import { TreatmentTimeline } from '@treatment-timeline/entities/treatment-timeline.entity';
import { DefaultTimelineMessageData } from '@treatment-timeline/dto/treatment-timeline.dto';
import { Treatment } from '@treatments/entities/treatments.entity';
import { OauthUser } from '@oauth/entities/oauth-users.entity';
import { TreatmentBuddy } from '@treatments/entities/treatment-buddy.entity';
import { TreatmentFileAttachedEvent } from '@treatments/treatments.event';
import { GroupMemberAddedEvent } from '@groups/groups.events';
import { SendUserToolkitReminderEvent } from '@schedules/schedule.event';
import { FriendFollowedEvent } from '@users/user.event';
export const EMAIL_QUEUE = 'emails';
export const emailQueueConfig: BullModuleOptions = {
  name: EMAIL_QUEUE,
  defaultJobOptions: defaultJobOptions,
};
export enum EmailsJob {
  ACTIVATION_EMAIL = '[EMAIL] ACTIVATION EMAIL',
  INTRODUCTION_VIDEO_DAY_THREE = '[EMAIL] INTRODUCTION_EMAIL_DAY_THREE',
  INTRODUCTION_VIDEO_DAY_SEVEN = '[EMAIL] INTRODUCTION_EMAIL_DAY_SEVEN',
  INACTIVITY_REFRESHER_EMAIL = '[EMAIL] INACTIVITY REFRESHER EMAIL',
  AGENDA_REMINDER_EMAIL = '[EMAIL] AGENDA REMINDER EMAIL',
  SHOP_ITEM_PURCHASE_EMAIL = '[EMAIL] SHOP ITEM PURCHASE EMAIL',
  TROPHY_ACHIVED_EMAIL = '[EMAIL] TROPHY ACHIEVED EMAIL',
  CHANNEL_POST_DISABLED_BY_ADMIN = '[EMAIL] CHANNEL POST DISABLED BY ADMIN EMAIL',
  ACTION_CLAIMED_EMAIL = '[EMAIL] ACTION_CLAIMED_EMAIL',
  SEND_APPOINTMENT_ADDED_EMAIL = '[EMAIL] SEND APPOINTMENT ADDED EMAIL',
  SEND_TOOL_KIT_TIMELINE_MESSAGE_ADDED_EMAIL = '[EMAIL] SEND TOOL KIT TIMELINE MESSAGE ADDED EMAIL',
  SEND_FORM_ADDED_EMAIL = '[EMAIL] SEND FORM ADDED EMAIL',
  SEND_DEFAULT_TIMELINE_MESSAGE_ADDED_EMAIL = '[EMAIL] SEND DEFAULT TIMELINE MESSAGE ADDED EMAIL',
  SEND_TREATMENT_CLOSED_EMAIL = '[EMAIL] SEND TREATMENT CLOSED EMAIL',
  SEND_USER_ACTIVATION_CODE_EMAIL = '[EMAIL] SEND USER ACTIVATION CODE EMAIL',
  SEND_BUDDY_TREATMENT_EMAIL = '[EMAIL] SEND BUDDY TREATMENT EMAIL',
  SEND_TREATMENT_FILE_ATTACHED_EMAIL = '[EMAIL] SEND_TREATMENT_FILE_ATTACHED_EMAIL',
  SEND_GROUP_MEMBER_ADDED_EMAIL = '[EMAIL] SEND_GROUP_MEMBER_ADDED_EMAIL',
  SEND_USER_TOOLKIT_REMINDER_EMAIL = '[EMAIL] SEND_USER_TOOLKIT_REMINDER_EMAIL',
  SEND_FRIEND_FOLLOWED_EMAIL = '[EMAIL] SEND FRIEND FOLLOWED EMAIL',
}

export const registerEmailsQueue =
  BullModule.registerQueueAsync(emailQueueConfig);

@Injectable()
export class EmailsQueue {
  private logger = new Logger(EmailsQueue.name);
  constructor(
    @InjectQueue(EMAIL_QUEUE)
    private readonly emailQueue: Queue,
  ) {}

  async addIntroductionVideoDayThree(
    delay: number,
    videoEmailData: VideoEmailData,
  ): Promise<void> {
    const opts = {
      delay: delay,
    };
    const job = await this.emailQueue.add(
      EmailsJob.INTRODUCTION_VIDEO_DAY_THREE,
      videoEmailData,
      opts,
    );
    this.logger.log(job.opts);
  }

  async addIntroductionVideoDaySeven(
    delay: number,
    videoEmailData: VideoEmailData,
  ): Promise<void> {
    const opts = {
      delay: delay,
    };
    const job = await this.emailQueue.add(
      EmailsJob.INTRODUCTION_VIDEO_DAY_SEVEN,
      videoEmailData,
      opts,
    );
    this.logger.log(job.opts);
  }

  async addActivationEmail(videoEmailData: VideoEmailData): Promise<void> {
    const job = await this.emailQueue.add(
      EmailsJob.ACTIVATION_EMAIL,
      videoEmailData,
    );
    this.logger.log(job.opts);
  }

  async addInactivityRefresher(userId: string): Promise<void> {
    const job = await this.emailQueue.add(
      EmailsJob.INACTIVITY_REFRESHER_EMAIL,
      { userId: userId },
    );
    this.logger.log(job.opts);
  }

  async addAgendaReminderEmail(
    scheduleReminder: ScheduleReminder,
    agenda: Toolkit,
  ): Promise<void> {
    const data: AgendaReminderData = {
      scheduleReminder: scheduleReminder,
      agenda: agenda,
    };
    await this.emailQueue.add(EmailsJob.AGENDA_REMINDER_EMAIL, data);
  }

  async addShopItemPurchaseEmail(
    purchasedItem: ShopitemPurchase,
  ): Promise<void> {
    await this.emailQueue.add(
      EmailsJob.SHOP_ITEM_PURCHASE_EMAIL,
      purchasedItem,
    );
  }

  async addTrophyAchivedEmail(achivedTrophy: UserTrophy): Promise<void> {
    await this.emailQueue.add(EmailsJob.TROPHY_ACHIVED_EMAIL, achivedTrophy);
  }

  async addChannelPostDisabledByAdminEmail(userId: string): Promise<void> {
    await this.emailQueue.add(EmailsJob.CHANNEL_POST_DISABLED_BY_ADMIN, {
      userId: userId,
    });
  }

  async addActionClaimedEmail(savedUserAction: UserAction): Promise<void> {
    await this.emailQueue.add(EmailsJob.ACTION_CLAIMED_EMAIL, savedUserAction);
  }

  async sendAppointmentAddedEmailJob(
    savedTreatmentTimeline: TreatmentTimeline,
  ): Promise<void> {
    await this.emailQueue.add(
      EmailsJob.SEND_APPOINTMENT_ADDED_EMAIL,
      savedTreatmentTimeline,
    );
  }

  async sendToolkitTimelineMessageAddedEmailJob(
    savedToolkitTreatmentTimelineMessage: TreatmentTimeline,
  ): Promise<void> {
    await this.emailQueue.add(
      EmailsJob.SEND_TOOL_KIT_TIMELINE_MESSAGE_ADDED_EMAIL,
      savedToolkitTreatmentTimelineMessage,
    );
  }

  async sendFormAddedEmailJob(
    savedTreatmentTimeline: TreatmentTimeline,
  ): Promise<void> {
    await this.emailQueue.add(
      EmailsJob.SEND_FORM_ADDED_EMAIL,
      savedTreatmentTimeline,
    );
  }

  async sendDefaultTimelineMessageAddedEmailJob(
    savedDefaultTreatmentTimelineMessage: DefaultTimelineMessageData,
  ): Promise<void> {
    await this.emailQueue.add(
      EmailsJob.SEND_DEFAULT_TIMELINE_MESSAGE_ADDED_EMAIL,
      savedDefaultTreatmentTimelineMessage,
    );
  }

  async sendTreatmentClosedEmailJob(treatment: Treatment): Promise<void> {
    await this.emailQueue.add(EmailsJob.SEND_TREATMENT_CLOSED_EMAIL, treatment);
  }

  async sendUserActivationCodeEmail(oauthUser: OauthUser): Promise<void> {
    await this.emailQueue.add(
      EmailsJob.SEND_USER_ACTIVATION_CODE_EMAIL,
      oauthUser,
    );
  }

  async sendBuddyTreatmentEmail(treatmentBuddy: TreatmentBuddy): Promise<void> {
    await this.emailQueue.add(
      EmailsJob.SEND_BUDDY_TREATMENT_EMAIL,
      treatmentBuddy,
    );
  }

  async sendTreatementFileAttachedEvent(
    payload: TreatmentFileAttachedEvent,
  ): Promise<void> {
    await this.emailQueue.add(
      EmailsJob.SEND_TREATMENT_FILE_ATTACHED_EMAIL,
      payload,
    );
  }

  async addGroupMemberAddedEmailJob(
    payload: GroupMemberAddedEvent,
  ): Promise<void> {
    await this.emailQueue.add(EmailsJob.SEND_GROUP_MEMBER_ADDED_EMAIL, payload);
  }
  async addUserToolkitReminderEmail(
    payload: SendUserToolkitReminderEvent,
  ): Promise<void> {
    await this.emailQueue.add(
      EmailsJob.SEND_USER_TOOLKIT_REMINDER_EMAIL,
      payload,
    );
  }
  async sendFriendFollowedEmail(
    friendFollowed: FriendFollowedEvent,
  ): Promise<void> {
    await this.emailQueue.add(
      EmailsJob.SEND_FRIEND_FOLLOWED_EMAIL,
      friendFollowed,
    );
  }
}
