import { defaultWorkersConcurrency } from '@core/configs/bull.config';
import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import Bull from 'bull';
import { AgendaReminderData } from '../notifications/notifications.model';
import { ProcessorLogger } from '../core/helpers/processor-logging.helper';
import { VideoEmailData } from './emails.dto';
import { EmailsJob, EMAIL_QUEUE } from './emails.queue';
import { EmailsService } from './emails.service';
import { ShopitemPurchase } from '../users/users.dto';
import { UserTrophy } from '../trophies/trophies.dto';
import { UserAction } from '../actions/actions.dto';
import { SendEmailCommandOutput } from '@aws-sdk/client-sesv2';
import { TreatmentTimeline } from '@treatment-timeline/entities/treatment-timeline.entity';
import { DefaultTimelineMessageData } from '@treatment-timeline/dto/treatment-timeline.dto';
import { Treatment } from '@treatments/entities/treatments.entity';
import { OauthUser } from '@oauth/entities/oauth-users.entity';
import { TreatmentBuddy } from '@treatments/entities/treatment-buddy.entity';
import { TreatmentFileAttachedEvent } from '@treatments/treatments.event';
import { SendUserToolkitReminderEvent } from '@schedules/schedule.event';
import { GroupMemberAddedEvent } from '@groups/groups.events';
import { FriendFollowedEvent } from '@users/user.event';

@Processor(EMAIL_QUEUE)
export class EmailsProcessor extends ProcessorLogger {
  readonly logger = new Logger(EmailsProcessor.name);
  constructor(private readonly emailsService: EmailsService) {
    super();
  }

  @Process({
    name: EmailsJob.INTRODUCTION_VIDEO_DAY_THREE,
    concurrency: defaultWorkersConcurrency,
  })
  async introductionVideoDayThree(
    job: Bull.Job<VideoEmailData>,
  ): Promise<string> {
    try {
      const { data: videoEmailData } = job;
      return this.emailsService.sendIntroductionVideoEmails(videoEmailData);
    } catch (error) {
      this.logger.error(
        `${this.introductionVideoDayThree.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: EmailsJob.INTRODUCTION_VIDEO_DAY_SEVEN,
    concurrency: defaultWorkersConcurrency,
  })
  async introductionVideoDaySeven(
    job: Bull.Job<VideoEmailData>,
  ): Promise<string> {
    try {
      const { data: videoEmailData } = job;
      return this.emailsService.sendIntroductionVideoEmails(videoEmailData);
    } catch (error) {
      this.logger.error(
        `${this.introductionVideoDaySeven.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: EmailsJob.ACTIVATION_EMAIL,
    concurrency: defaultWorkersConcurrency,
  })
  async activationEmail(job: Bull.Job<VideoEmailData>): Promise<string> {
    try {
      const { data: videoEmailData } = job;
      return this.emailsService.sendIntroductionVideoEmails(videoEmailData);
    } catch (error) {
      this.logger.error(`${this.activationEmail.name}:${error.stack}`);
      throw error;
    }
  }

  @Process({
    name: EmailsJob.INACTIVITY_REFRESHER_EMAIL,
    concurrency: defaultWorkersConcurrency,
  })
  async inactivityRefresherEmail(
    job: Bull.Job<{ userId: string }>,
  ): Promise<string> {
    try {
      const {
        data: { userId },
      } = job;
      return this.emailsService.sendInactivityRefresherEmail(userId);
    } catch (error) {
      this.logger.error(`${this.inactivityRefresherEmail.name}:${error.stack}`);
      throw error;
    }
  }

  @Process({
    name: EmailsJob.AGENDA_REMINDER_EMAIL,
    concurrency: defaultWorkersConcurrency,
  })
  async sendAgendaReminderEmail(
    job: Bull.Job<AgendaReminderData>,
  ): Promise<string> {
    try {
      const { data } = job;
      return this.emailsService.sendAgendaReminderEmail(data);
    } catch (error) {
      this.logger.error(`${this.sendAgendaReminderEmail.name}:${error.stack}`);
      throw error;
    }
  }

  @Process({
    name: EmailsJob.SHOP_ITEM_PURCHASE_EMAIL,
    concurrency: defaultWorkersConcurrency,
  })
  async handleShopItemPurchase(
    job: Bull.Job<ShopitemPurchase>,
  ): Promise<string> {
    try {
      const { data: purchasedItem } = job;
      return this.emailsService.sendShopItemPurchaseEmail(purchasedItem);
    } catch (error) {
      this.logger.error(`${this.handleShopItemPurchase.name}:${error.stack}`);
      throw error;
    }
  }

  @Process({
    name: EmailsJob.TROPHY_ACHIVED_EMAIL,
    concurrency: defaultWorkersConcurrency,
  })
  async handleTrophyAchived(job: Bull.Job<UserTrophy>): Promise<string> {
    try {
      const { data: achivedTrophy } = job;
      return this.emailsService.sendTrophyAchivedEmail(achivedTrophy);
    } catch (error) {
      this.logger.error(`${this.handleTrophyAchived.name}:${error.stack}`);
      throw error;
    }
  }

  @Process({
    name: EmailsJob.CHANNEL_POST_DISABLED_BY_ADMIN,
    concurrency: defaultWorkersConcurrency,
  })
  async handleChannelPostDisabledByAdmin(
    job: Bull.Job<{ userId: string }>,
  ): Promise<string> {
    try {
      const {
        data: { userId },
      } = job;
      return this.emailsService.sendChannelPostDisabledByAdminEmail(userId);
    } catch (error) {
      this.logger.error(
        `${this.handleChannelPostDisabledByAdmin.name}:${error.stack}`,
      );
      throw error;
    }
  }
  @Process({
    name: EmailsJob.ACTION_CLAIMED_EMAIL,
    concurrency: defaultWorkersConcurrency,
  })
  async handleActionClaimedEmail(
    job: Bull.Job<UserAction>,
  ): Promise<SendEmailCommandOutput> {
    try {
      const { data: userAction } = job;
      return this.emailsService.sendActionClaimedVoucherCodeEmail(userAction);
    } catch (error) {
      this.logger.error(`${this.handleActionClaimedEmail.name}:${error.stack}`);
      throw error;
    }
  }

  @Process({
    name: EmailsJob.SEND_APPOINTMENT_ADDED_EMAIL,
    concurrency: defaultWorkersConcurrency,
  })
  async handleSendAppointmentAddedEmailJob(
    job: Bull.Job<TreatmentTimeline>,
  ): Promise<string> {
    try {
      const { data: treatmentTimeline } = job;
      return this.emailsService.sendAppointmentAddedEmail(treatmentTimeline);
    } catch (error) {
      this.logger.error(
        `${this.handleSendAppointmentAddedEmailJob.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: EmailsJob.SEND_TOOL_KIT_TIMELINE_MESSAGE_ADDED_EMAIL,
    concurrency: defaultWorkersConcurrency,
  })
  async handleToolkitTimelineMessageAddedEmailJob(
    job: Bull.Job<TreatmentTimeline>,
  ): Promise<SendEmailCommandOutput | string> {
    try {
      const { data: treatmentTimeline } = job;
      return this.emailsService.sendToolkitTimelineMessageAddedEmail(
        treatmentTimeline,
      );
    } catch (error) {
      this.logger.error(
        `${this.handleToolkitTimelineMessageAddedEmailJob.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: EmailsJob.SEND_FORM_ADDED_EMAIL,
    concurrency: defaultWorkersConcurrency,
  })
  async handleSendFormAddedEmailJob(
    job: Bull.Job<TreatmentTimeline>,
  ): Promise<SendEmailCommandOutput | string> {
    try {
      const { data: treatmentTimeline } = job;
      return this.emailsService.sendFormAddedEmail(treatmentTimeline);
    } catch (error) {
      this.logger.error(
        `${this.handleSendFormAddedEmailJob.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: EmailsJob.SEND_DEFAULT_TIMELINE_MESSAGE_ADDED_EMAIL,
    concurrency: defaultWorkersConcurrency,
  })
  async handleDefaultTimelineMessageAddedEmailJob(
    job: Bull.Job<DefaultTimelineMessageData>,
  ): Promise<SendEmailCommandOutput | string> {
    try {
      const { data: defaultTreatmentTimeline } = job;
      return this.emailsService.sendDefaultTimelineMessageAddedEmail(
        defaultTreatmentTimeline,
      );
    } catch (error) {
      this.logger.error(
        `${this.handleDefaultTimelineMessageAddedEmailJob.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: EmailsJob.SEND_TREATMENT_CLOSED_EMAIL,
    concurrency: defaultWorkersConcurrency,
  })
  async handleSendTreatmentClosedEmailJob(
    job: Bull.Job<Treatment>,
  ): Promise<SendEmailCommandOutput | string> {
    try {
      const { data: treatment } = job;

      await this.emailsService.sendTreatmentClosedEmail(treatment);
      await this.emailsService.sendAfterCareEmailToTreatmentOwner(treatment);

      return 'Treatment Closed Email Sent Successfully';
    } catch (error) {
      this.logger.error(
        `${this.handleSendTreatmentClosedEmailJob.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: EmailsJob.SEND_USER_ACTIVATION_CODE_EMAIL,
    concurrency: defaultWorkersConcurrency,
  })
  async handleSendUserActivationCodeEmailJob(
    job: Bull.Job<OauthUser>,
  ): Promise<SendEmailCommandOutput | string> {
    try {
      const { data: oauthUser } = job;
      return this.emailsService.sendUserActivationCodeEmail(oauthUser);
    } catch (error) {
      this.logger.error(
        `${this.handleSendUserActivationCodeEmailJob.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: EmailsJob.SEND_BUDDY_TREATMENT_EMAIL,
    concurrency: defaultWorkersConcurrency,
  })
  async handleSendBuddyTreatmentEmailJob(
    job: Bull.Job<TreatmentBuddy>,
  ): Promise<string | SendEmailCommandOutput> {
    try {
      const { data: treatmentBuddy } = job;
      return await this.emailsService.sendBuddyTreatmentEmail(treatmentBuddy);
    } catch (error) {
      this.logger.error(
        `${this.handleSendBuddyTreatmentEmailJob.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: EmailsJob.SEND_TREATMENT_FILE_ATTACHED_EMAIL,
    concurrency: defaultWorkersConcurrency,
  })
  async handleSendTreatementFileAttachedEmailJob(
    job: Bull.Job<TreatmentFileAttachedEvent>,
  ): Promise<string> {
    try {
      const {
        data: { treatmentId, userId },
      } = job;
      return this.emailsService.sendTreatementFileAttachedEmail(
        treatmentId,
        userId,
      );
    } catch (error) {
      this.logger.error(
        `${this.handleSendTreatementFileAttachedEmailJob.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: EmailsJob.SEND_USER_TOOLKIT_REMINDER_EMAIL,
    concurrency: defaultWorkersConcurrency,
  })
  async sendUserToolkitReminderEmail(
    job: Bull.Job<SendUserToolkitReminderEvent>,
  ): Promise<string> {
    try {
      const { data } = job;
      return this.emailsService.sendUserToolkitReminderEmail(data);
    } catch (error) {
      this.logger.error(
        `${this.sendUserToolkitReminderEmail.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: EmailsJob.SEND_GROUP_MEMBER_ADDED_EMAIL,
    concurrency: defaultWorkersConcurrency,
  })
  async handleSendGroupMemberAddedEmailJob(
    job: Bull.Job<GroupMemberAddedEvent>,
  ): Promise<SendEmailCommandOutput | string> {
    try {
      const { data: payload } = job;
      return this.emailsService.sendGroupMemberAddedEmail(payload.userChannel);
    } catch (error) {
      this.logger.error(
        `${this.handleSendGroupMemberAddedEmailJob.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: EmailsJob.SEND_FRIEND_FOLLOWED_EMAIL,
    concurrency: defaultWorkersConcurrency,
  })
  async handleSendFriendFollowedEmailJob(
    job: Bull.Job<FriendFollowedEvent>,
  ): Promise<SendEmailCommandOutput | string> {
    try {
      const { data: payload } = job;
      return this.emailsService.sendFriendFollowedEmail(payload.friendFollowed);
    } catch (error) {
      this.logger.error(
        `${this.handleSendFriendFollowedEmailJob.name}:${error.stack}`,
      );
      throw error;
    }
  }
}
