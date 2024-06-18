import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import * as OneSignal from '@onesignal/node-onesignal';
import Bull from 'bull';
import {
  AgendaReminderData,
  CheckInReminderData,
  EngagementNotification,
} from './notifications.model';
import {
  ChannelFollowedEvent,
  ChannelPostLikeUpdatedEvent,
  PostReactionAddedEvent,
  PostThankYouEvent,
} from '../channels/channels.event';
import {
  FriendFollowedEvent,
  FriendRequestCreatedEvent,
  HLPPointsDonatedEvent,
  UserSignedUpEvent,
} from '../users/user.event';
import { ChallengeEndedEvent } from '../challenges/challenges.event';
import { BonusAvailableEvent } from '../bonuses/bonuses.event';
import { OneSignalService } from '@shared/services/one-signal/one-signal';
import { defaultWorkersConcurrency } from '@core/configs/bull.config';
import { ProcessorLogger } from '@core/helpers/processor-logging.helper';
import {
  GroupVideoCallInitiatedEvent,
  VideoCallInitiatedEvent,
} from '@video-calls/video-calls.event';
import { groupInvitationCreatedEvent } from '../groups/groups.events';
import {
  TreatmentAddedEvent,
  TreatmentClosedEvent,
  TreatmentTeamCoachAddedEvent,
} from '@treatments/treatments.event';
import { NotificationsService } from './notifications.service';
import {
  ScheduleAddedEvent,
  SendAppointmentReminderEvent,
  SendUserToolkitReminderEvent,
} from '@schedules/schedule.event';
import {
  ToolkitTimelineMessageAddedEvent,
  TreatmentTimelineFileAddedEvent,
  TreatmentTimelineNoteAddedEvent,
} from '@treatment-timeline/treatment-timeline.event';
import { ScheduleSessionAddedEvent } from '@schedule-sessions/schedule-sessions.event';
import { NOTIFICATIONS_QUEUE, notificationsJob } from './notifications.queue';

@Processor(NOTIFICATIONS_QUEUE)
export class NotificationsProcessor extends ProcessorLogger {
  readonly logger = new Logger(NotificationsProcessor.name);
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly oneSignalService: OneSignalService,
  ) {
    super();
  }

  @Process({
    name: notificationsJob.SEND_NOTIFICATION,
    concurrency: defaultWorkersConcurrency,
  })
  async sendNotification(
    notification: OneSignal.Notification,
  ): Promise<OneSignal.CreateNotificationSuccessResponse> {
    try {
      return await this.oneSignalService.sendNotification(notification);
    } catch (error) {
      this.logger.error(`${this.sendNotification.name}:${error.stack}`);
      throw error;
    }
  }

  @Process({
    name: notificationsJob.CHECK_ENGAGEMENT_NOTIFICATION,
    concurrency: defaultWorkersConcurrency,
  })
  async checkEngagementNotification(): Promise<string> {
    try {
      return this.notificationsService.checkEngagementNotification();
    } catch (error) {
      this.logger.error(
        `${this.checkEngagementNotification.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: notificationsJob.SEND_ENGAGEMENT_NOTIFICATION,
    concurrency: defaultWorkersConcurrency,
  })
  async sendEngagementNotification(
    job: Bull.Job<EngagementNotification>,
  ): Promise<string> {
    try {
      const { data: engagementNotification } = job;
      return this.notificationsService.sendEngagementNotification(
        engagementNotification,
      );
    } catch (error) {
      this.logger.error(
        `${this.sendEngagementNotification.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: notificationsJob.SEND_POST_LIKED_NOTIFICATION,
    concurrency: defaultWorkersConcurrency,
  })
  async sendPostLikedNotification(
    job: Bull.Job<ChannelPostLikeUpdatedEvent>,
  ): Promise<string> {
    try {
      const { data: ChannelPostLikeUpdatedEvent } = job;
      return this.notificationsService.sendPostLikedNotification(
        ChannelPostLikeUpdatedEvent,
      );
    } catch (error) {
      this.logger.error(
        `${this.sendPostLikedNotification.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: notificationsJob.SEND_FRIEND_FOLLOWED_NOTIFICATION,
    concurrency: defaultWorkersConcurrency,
  })
  async sendFriendFollowedNotification(
    job: Bull.Job<FriendFollowedEvent>,
  ): Promise<string> {
    try {
      const { data: FriendFollowedEvent } = job;
      return this.notificationsService.sendFriendFollowedNotification(
        FriendFollowedEvent,
      );
    } catch (error) {
      this.logger.error(
        `${this.sendFriendFollowedNotification.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: notificationsJob.SEND_CHECK_IN_REMINDER_NOTIFICATION,
    concurrency: defaultWorkersConcurrency,
  })
  async sendCheckInReminderNotification(
    job: Bull.Job<CheckInReminderData>,
  ): Promise<string> {
    try {
      const { data } = job;
      return this.notificationsService.sendCheckInReminderNotification(data);
    } catch (error) {
      this.logger.error(
        `${this.sendCheckInReminderNotification.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: notificationsJob.LATE_CHECK_IN_REMINDER_NOTIFICATION,
    concurrency: defaultWorkersConcurrency,
  })
  async sendLateCheckInReminderNotification(
    job: Bull.Job<CheckInReminderData>,
  ): Promise<string> {
    try {
      const { data } = job;
      return this.notificationsService.sendLateCheckInReminderNotification(
        data,
      );
    } catch (error) {
      this.logger.error(
        `${this.sendLateCheckInReminderNotification.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: notificationsJob.SEND_AGENDA_REMINDER_NOTIFICATION,
    concurrency: defaultWorkersConcurrency,
  })
  async sendAgendaReminderNotification(
    job: Bull.Job<AgendaReminderData>,
  ): Promise<string> {
    try {
      const { data } = job;
      return this.notificationsService.sendAgendaReminderNotification(data);
    } catch (error) {
      this.logger.error(
        `${this.sendAgendaReminderNotification.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: notificationsJob.SEND_INACTIVITY_NOTIFICATION,
    concurrency: defaultWorkersConcurrency,
  })
  async sendInactivityNotification(): Promise<string> {
    try {
      return this.notificationsService.sendInactivityNotification();
    } catch (error) {
      this.logger.error(
        `${this.sendInactivityNotification.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: notificationsJob.SEND_CHALLENGE_ENDED_NOTIFICATION,
    concurrency: defaultWorkersConcurrency,
  })
  async sendChallengeEndedNotification(
    job: Bull.Job<ChallengeEndedEvent>,
  ): Promise<string> {
    try {
      const { data: ChallengeAddedEvent } = job;
      return this.notificationsService.sendChallengeEndedNotification(
        ChallengeAddedEvent,
      );
    } catch (error) {
      this.logger.error(
        `${this.sendChallengeEndedNotification.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: notificationsJob.SEND_HLP_DONATED_NOTIFICATION,
    concurrency: defaultWorkersConcurrency,
  })
  async sendHlpDonatedNotification(
    job: Bull.Job<HLPPointsDonatedEvent>,
  ): Promise<string> {
    try {
      const { data: HLPPointsDonatedEvent } = job;
      return this.notificationsService.sendHlpDonatedNotification(
        HLPPointsDonatedEvent,
      );
    } catch (error) {
      this.logger.error(
        `${this.sendHlpDonatedNotification.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: notificationsJob.SEND_BONUS_AVAILABLE_NOTIFICATION,
    concurrency: defaultWorkersConcurrency,
  })
  async sendBonusAvailableNotification(
    job: Bull.Job<BonusAvailableEvent>,
  ): Promise<string> {
    try {
      const {
        data: { bonus },
      } = job;
      return this.notificationsService.sendBonusAvailableNotification(bonus);
    } catch (error) {
      this.logger.error(
        `${this.sendBonusAvailableNotification.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: notificationsJob.SEND_POST_REACTION_NOTIFICATION,
    concurrency: defaultWorkersConcurrency,
  })
  async sendPostReactionNotification(
    job: Bull.Job<PostReactionAddedEvent>,
  ): Promise<string> {
    try {
      const { data: PostReactionEvent } = job;
      return this.notificationsService.sendPostReactionNotification(
        PostReactionEvent,
      );
    } catch (error) {
      this.logger.error(
        `${this.sendPostReactionNotification.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: notificationsJob.SEND_POST_THANK_YOY_NOTIFICATION,
    concurrency: defaultWorkersConcurrency,
  })
  async sendPostThankYouNotification(
    job: Bull.Job<PostThankYouEvent>,
  ): Promise<string> {
    try {
      const { data: PostThankYouEvent } = job;
      return this.notificationsService.sendPostThankYouNotification(
        PostThankYouEvent,
      );
    } catch (error) {
      this.logger.error(
        `${this.sendPostThankYouNotification.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: notificationsJob.SEND_VIDEO_CALL_NOTIFICATION,
    concurrency: defaultWorkersConcurrency,
  })
  async handleSendVideoCallNotificationJob(
    job: Bull.Job<VideoCallInitiatedEvent>,
  ): Promise<string> {
    try {
      const { data: payload } = job;
      return this.notificationsService.sendVideoCallNotification(payload);
    } catch (error) {
      this.logger.error(
        `${this.handleSendVideoCallNotificationJob.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: notificationsJob.PREPARE_GROUP_VIDEO_CALL_NOTIFICATIONS,
    concurrency: defaultWorkersConcurrency,
  })
  async handlePrepareGroupVideoCallNotificationJob(
    job: Bull.Job<GroupVideoCallInitiatedEvent>,
  ): Promise<string> {
    try {
      const { data: payload } = job;
      return this.notificationsService.prepareGroupVideoCallNotifications(
        payload,
      );
    } catch (error) {
      this.logger.error(
        `${this.handlePrepareGroupVideoCallNotificationJob.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: notificationsJob.SEND_GROUP_INVITATION_NOTIFICATION,
    concurrency: defaultWorkersConcurrency,
  })
  async handleSendGroupInvitationNotificationJob(
    job: Bull.Job<groupInvitationCreatedEvent>,
  ): Promise<string> {
    try {
      const { data: payload } = job;
      return this.notificationsService.sendGroupInvitationNotification(
        payload.channelInvitation,
      );
    } catch (error) {
      this.logger.error(
        `${this.handleSendGroupInvitationNotificationJob.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: notificationsJob.SEND_FRIEND_REQUEST_NOTIFICATION,
    concurrency: defaultWorkersConcurrency,
  })
  async handleSendFriendRequestNotificationJob(
    job: Bull.Job<FriendRequestCreatedEvent>,
  ): Promise<string> {
    try {
      const {
        data: { userFriendRequest },
      } = job;
      return this.notificationsService.sendFriendRequestNotification(
        userFriendRequest,
      );
    } catch (error) {
      this.logger.error(
        `${this.handleSendFriendRequestNotificationJob.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: notificationsJob.SEND_COACH_ADDED_NOTIFICATION,
    concurrency: defaultWorkersConcurrency,
  })
  async handleCoachAddedNotificationJob(
    job: Bull.Job<TreatmentTeamCoachAddedEvent>,
  ): Promise<string> {
    try {
      const {
        data: { doctorTreatment },
      } = job;
      return this.notificationsService.sendCoachAddedNotification(
        doctorTreatment,
      );
    } catch (error) {
      this.logger.error(
        `${this.handleCoachAddedNotificationJob.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: notificationsJob.COACH_ADDED_TO_GROUP_NOTIFICATION,
    concurrency: defaultWorkersConcurrency,
  })
  async handleSendCoachAddedGroupNotificationJob(
    job: Bull.Job<ChannelFollowedEvent>,
  ): Promise<string> {
    try {
      const { data: payload } = job;
      return this.notificationsService.sendCoachAddedGroupNotification(
        payload.userChannel,
      );
    } catch (error) {
      this.logger.error(
        `${this.handleSendCoachAddedGroupNotificationJob.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: notificationsJob.TREATMENT_ADDED_NOTIFICATION,
    concurrency: defaultWorkersConcurrency,
  })
  async handleTreatmentAddedNotificationJob(
    job: Bull.Job<TreatmentAddedEvent>,
  ): Promise<string> {
    try {
      const { data: payload } = job;
      return this.notificationsService.sendTreatmentAddedNotification(payload);
    } catch (error) {
      this.logger.error(
        `${this.handleTreatmentAddedNotificationJob.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: notificationsJob.TREATMENT_TIMELINE_NOTE_ADDED_NOTIFICATION,
    concurrency: defaultWorkersConcurrency,
  })
  async handleTimelineNoteAddedNotificationJob(
    job: Bull.Job<TreatmentTimelineNoteAddedEvent>,
  ): Promise<string> {
    try {
      const { data: payload } = job;
      return this.notificationsService.sendTimelineNoteAddedNotification(
        payload,
      );
    } catch (error) {
      this.logger.error(
        `${this.handleTimelineNoteAddedNotificationJob.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: notificationsJob.SEND_USER_REGISTERED_NOTIFICATION,
    concurrency: defaultWorkersConcurrency,
  })
  async handleUserRegisteredNotificationJob(
    job: Bull.Job<UserSignedUpEvent>,
  ): Promise<string> {
    try {
      const { data: payload } = job;
      return this.notificationsService.sendUserRegisteredNotification(
        payload.user,
      );
    } catch (error) {
      this.logger.error(
        `${this.handleUserRegisteredNotificationJob.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: notificationsJob.APPOINTMENT_SCHEDULE_ADDED_NOTIFICATION,
    concurrency: defaultWorkersConcurrency,
  })
  async handleAppointmentScheduleAddedNotificationJob(
    job: Bull.Job<ScheduleAddedEvent>,
  ): Promise<string> {
    try {
      const { data: payload } = job;
      return this.notificationsService.sendAppointmentScheduleAddedNotification(
        payload.schedule,
      );
    } catch (error) {
      this.logger.error(
        `${this.handleAppointmentScheduleAddedNotificationJob.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: notificationsJob.TREATMENT_TIMELINE_FILE_ADDED_NOTIFICATION,
    concurrency: defaultWorkersConcurrency,
  })
  async handleTreatmentTimelineFileAddedNotificationJob(
    job: Bull.Job<TreatmentTimelineFileAddedEvent>,
  ): Promise<string> {
    try {
      const { data: payload } = job;
      return this.notificationsService.sendTreatmentTimelineFileAddedNotification(
        payload,
      );
    } catch (error) {
      this.logger.error(
        `${this.handleTreatmentTimelineFileAddedNotificationJob.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: notificationsJob.ACTIVITY_SCHEDULE_ADDED_NOTIFICATION,
    concurrency: defaultWorkersConcurrency,
  })
  async handleActivityScheduleAddedNotificationJob(
    job: Bull.Job<ScheduleAddedEvent>,
  ): Promise<string> {
    try {
      const { data: payload } = job;
      return this.notificationsService.sendActivityScheduleAddedNotification(
        payload.schedule,
      );
    } catch (error) {
      this.logger.error(
        `${this.handleActivityScheduleAddedNotificationJob.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: notificationsJob.SEND_USER_APPOINTMENT_REMINDER_NOTIFICATION,
    concurrency: defaultWorkersConcurrency,
  })
  async handleUserAppointmentReminderNotificationJob(
    job: Bull.Job<SendAppointmentReminderEvent>,
  ): Promise<string> {
    try {
      const { data: payload } = job;
      return this.notificationsService.sendUserAppointmentReminderNotification(
        payload,
      );
    } catch (error) {
      this.logger.error(
        `${this.handleUserAppointmentReminderNotificationJob.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: notificationsJob.SEND_TREATMENT_CLOSED_NOTIFICATION,
    concurrency: defaultWorkersConcurrency,
  })
  async handleTreatmentClosedNotificationJob(
    job: Bull.Job<TreatmentClosedEvent>,
  ): Promise<string> {
    try {
      const { data: payload } = job;
      const { treatment } = payload;
      const { has_participated_in_start_program } = treatment;
      await this.notificationsService.sendTreatmentClosedNotification(payload);

      if (has_participated_in_start_program) {
        await this.notificationsService.sendTreatmentClosedOwnerEmail(payload);
      }

      return 'Treatment Closed Notification Sent Successfully';
    } catch (error) {
      this.logger.error(
        `${this.handleTreatmentClosedNotificationJob.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: notificationsJob.SEND_GROUP_MEMBER_ADDED_NOTIFICATION,
    concurrency: defaultWorkersConcurrency,
  })
  async handleSendGroupMemberAddedNotificationJob(
    job: Bull.Job<ChannelFollowedEvent>,
  ): Promise<string> {
    try {
      const { data: payload } = job;
      return this.notificationsService.sendGroupMemberAddedNotification(
        payload.userChannel,
      );
    } catch (error) {
      this.logger.error(
        `${this.handleSendGroupMemberAddedNotificationJob.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: notificationsJob.SEND_TOOLKIT_PERFORMED_NOTIFICATION,
    concurrency: defaultWorkersConcurrency,
  })
  async handleSendToolkitPerformedNotificationJob(
    job: Bull.Job<ScheduleSessionAddedEvent>,
  ): Promise<string> {
    try {
      const {
        data: { scheduleSession },
      } = job;
      return this.notificationsService.sendToolkitPerformedNotification(
        scheduleSession,
      );
    } catch (error) {
      this.logger.error(
        `${this.handleSendToolkitPerformedNotificationJob.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: notificationsJob.SEND_TOOLKIT_TIMELINE_MESSAGE_ADDED_NOTIFICATION,
    concurrency: defaultWorkersConcurrency,
  })
  async handleSendToolkitTimelineMessageAddedNotificationJob(
    job: Bull.Job<ToolkitTimelineMessageAddedEvent>,
  ): Promise<string> {
    try {
      const { data: payload } = job;
      return this.notificationsService.sendToolkitTimelineMessageAddedNotification(
        payload,
      );
    } catch (error) {
      this.logger.error(
        `${this.handleSendToolkitTimelineMessageAddedNotificationJob.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: notificationsJob.SEND_USER_TOOLKIT_REMINDER_NOTIFICATION,
    concurrency: defaultWorkersConcurrency,
  })
  async handleUserToolkitReminderNotificationJob(
    job: Bull.Job<SendUserToolkitReminderEvent>,
  ): Promise<string> {
    try {
      const { data: payload } = job;
      return this.notificationsService.sendUserToolkitReminderNotification(
        payload,
      );
    } catch (error) {
      this.logger.error(
        `${this.handleUserToolkitReminderNotificationJob.name}:${error.stack}`,
      );
      throw error;
    }
  }
}
