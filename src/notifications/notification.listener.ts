import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  FriendFollowedEvent,
  FriendRequestCreatedEvent,
  HLPPointsDonatedEvent,
  UserEvent,
  UserSignedUpEvent,
} from '../users/user.event';
import {
  ChannelPostLikeUpdatedEvent,
  ChannelsEvent,
  PostReactionAddedEvent,
  PostThankYouEvent,
} from '../channels/channels.event';
import {
  NotificationEvent,
  SendEngagementNotificationEvent,
} from './notifications.event';
import { NotificationsQueue } from './notifications.queue';
import {
  ChallengeEndedEvent,
  ChallengesEvent,
} from '../challenges/challenges.event';
import { BonusAvailableEvent, BonusesEvent } from '../bonuses/bonuses.event';
import {
  ScheduleAddedEvent,
  ScheduleEvent,
  SendAgendaReminderEvent,
  SendAppointmentReminderEvent,
  SendCheckInReminderEvent,
  SendUserToolkitReminderEvent,
} from '../schedules/schedule.event';
import {
  GroupVideoCallInitiatedEvent,
  VideoCallInitiatedEvent,
  VideoCallsEvent,
} from '../video-calls/video-calls.event';
import {
  GroupMemberAddedEvent,
  GroupOwnerAddedEvent,
  GroupsEvent,
  groupInvitationCreatedEvent,
} from '../groups/groups.events';
import {
  TreatmentAddedEvent,
  TreatmentClosedEvent,
  TreatmentTeamCoachAddedEvent,
  TreatmentsEvent,
} from '@treatments/treatments.event';
import {
  ToolkitTimelineMessageAddedEvent,
  TreatmentTimelineEvent,
  TreatmentTimelineFileAddedEvent,
  TreatmentTimelineNoteAddedEvent,
} from '@treatment-timeline/treatment-timeline.event';
import { NotificationsRepo } from './notifications.repo';
import { NotificationsService } from './notifications.service';
import { UserRoles } from '@users/users.dto';
import { ScheduleFor } from '@schedules/entities/schedule.entity';
import {
  ScheduleSessionAddedEvent,
  ScheduleSessionEvent,
} from '@schedule-sessions/schedule-sessions.event';
@Injectable()
export class NotificationsEventListener {
  private readonly logger = new Logger(NotificationsEventListener.name);
  constructor(
    private readonly notificationsQueue: NotificationsQueue,
    private readonly notificationsService: NotificationsService,
    private readonly notificationsRepo: NotificationsRepo,
  ) {}

  @OnEvent(NotificationEvent.SEND_ENGAGEMENT_NOTIFICATION)
  async handleSendEngagementNotificationEvent(
    payload: SendEngagementNotificationEvent,
  ): Promise<void> {
    const { engagementNotification } = payload;
    await this.notificationsQueue.sendEngagementNotification(
      engagementNotification,
    );
  }
  @OnEvent(ChannelsEvent.CHANNEL_POST_LIKED)
  async handlePostLikedNotificationEvent(
    payload: ChannelPostLikeUpdatedEvent,
  ): Promise<void> {
    await this.notificationsQueue.sendPostLikeNotification(payload);
  }

  @OnEvent(UserEvent.FRIEND_FOLLOWED)
  async handleFriendFollowedNotificationEvent(
    payload: FriendFollowedEvent,
  ): Promise<void> {
    await this.notificationsQueue.sendFriendFollowedNotification(payload);
  }

  @OnEvent(ScheduleEvent.SEND_CHECK_IN_REMINDER)
  async handleSendCheckInReminderEvent(
    payload: SendCheckInReminderEvent,
  ): Promise<void> {
    const { scheduleReminder, checkIn } = payload;
    await this.notificationsQueue.sendCheckInReminderNotification(
      scheduleReminder,
      checkIn,
    );
    await this.notificationsQueue.addLateCheckInReminderNotification(
      scheduleReminder,
      checkIn,
    );
  }

  @OnEvent(ScheduleEvent.SEND_AGENDA_REMINDER)
  async handleSendAgendaReminderEvent(
    payload: SendAgendaReminderEvent,
  ): Promise<void> {
    const { scheduleReminder, agenda } = payload;
    await this.notificationsQueue.sendAgendaReminderNotification(
      scheduleReminder,
      agenda,
    );
  }

  @OnEvent(ChallengesEvent.CHALLENGE_ENDED)
  async handleChallengeEndedNotificationEvent(
    payload: ChallengeEndedEvent,
  ): Promise<void> {
    await this.notificationsQueue.sendChallengeEndedNotification(payload);
  }

  @OnEvent(UserEvent.HLP_POINTS_DONATED)
  async handleHlpDonatedNotificationEvent(
    payload: HLPPointsDonatedEvent,
  ): Promise<void> {
    await this.notificationsQueue.sendHlpDonatedNotification(payload);
  }

  @OnEvent(BonusesEvent.BONUS_AVAILABLE)
  async handleBonusAvailableNotificationEvent(
    nextBonus: BonusAvailableEvent,
  ): Promise<void> {
    await this.notificationsQueue.sendBonusAvailableNotification(nextBonus);
  }

  // @OnEvent(ChannelsEvent.CHANNEL_POST_REACTION)
  // async handlePostReactionNotificationEvent(
  //   payload: PostReactionEvent,
  // ): Promise<void> {
  //   await this.notificationsQueue.sendPostReactionNotification(payload);
  // }

  @OnEvent(ChannelsEvent.CHANNEL_POST_THANK_YOU)
  async handlePostThankYouNotificationEvent(
    payload: PostThankYouEvent,
  ): Promise<void> {
    await this.notificationsQueue.sendPostThankYouNotification(payload);
  }

  @OnEvent(VideoCallsEvent.ONE_ON_ONE_VIDEO_CALL_INITIATED)
  async handleOneOnOneVideoCallInitiatedEvent(
    payload: VideoCallInitiatedEvent,
  ): Promise<void> {
    await this.notificationsQueue.addVideoCallNotificationJob(payload);
  }

  /**
   * @deprecated it will be remove because coach added group directly without groupInvitation.
   */

  @OnEvent(GroupsEvent.GROUP_INVITATION_CREATED)
  async handleGroupInvitationCreatedEvent(
    payload: groupInvitationCreatedEvent,
  ): Promise<void> {
    await this.notificationsQueue.addGroupInvitationNotificationJob(payload);
  }

  @OnEvent(UserEvent.FRIEND_REQUEST_CREATED)
  async handleFriendRequestCreatedEvent(
    payload: FriendRequestCreatedEvent,
  ): Promise<void> {
    await this.notificationsQueue.addFriendRequestNotificationJob(payload);
  }

  @OnEvent(VideoCallsEvent.GROUP_VIDEO_CALL_INITIATED)
  async handleGroupVideoCallInitiatedEvent(
    payload: GroupVideoCallInitiatedEvent,
  ): Promise<void> {
    await this.notificationsQueue.addPrepareGroupVideoCallNotificationsJob(
      payload,
    );
  }

  @OnEvent(TreatmentsEvent.TREATMENT_TEAM_COACH_ADDED)
  async handleTreatmentTeamCoachAddedEvent(
    payload: TreatmentTeamCoachAddedEvent,
  ): Promise<void> {
    await this.notificationsQueue.addCoachAddedNotificationsJob(payload);
  }

  @OnEvent(ChannelsEvent.CHANNEL_POST_REACTION_ADDED)
  async handleChannelPostReactionAddedEvent(
    payload: PostReactionAddedEvent,
  ): Promise<void> {
    await this.notificationsQueue.sendPostReactionNotification(payload);
  }

  @OnEvent(GroupsEvent.GROUP_MEMBER_ADDED)
  async handleGroupMemberAddedEvent(
    payload: GroupMemberAddedEvent,
  ): Promise<void> {
    await this.notificationsQueue.sendGroupMemberAddedNotificationJob(payload);
  }

  @OnEvent(GroupsEvent.GROUP_OWNER_ADDED)
  async handleGroupOwnerAddedEvent(
    payload: GroupOwnerAddedEvent,
  ): Promise<void> {
    await this.notificationsQueue.addCoachGroupNotificationJob(payload);
  }

  @OnEvent(TreatmentsEvent.TREATMENT_ADDED)
  async handleTreatmentAddedEvent(payload: TreatmentAddedEvent): Promise<void> {
    await this.notificationsQueue.addTreatmentAddedNotificationJob(payload);
  }

  @OnEvent(TreatmentTimelineEvent.NOTE_ADDED_IN_TREATMENT_TIMELINE)
  async handleTimelineNoteAddedEvent(
    payload: TreatmentTimelineNoteAddedEvent,
  ): Promise<void> {
    const { timelineAttachment } = payload;
    const { created_by } = timelineAttachment;
    const user = await this.notificationsRepo.getUserById(created_by);
    if (user.role != UserRoles.DOCTOR || timelineAttachment.is_private_note) {
      return;
    }
    await this.notificationsQueue.addTimelineNoteAddedNotificationJob(payload);
  }

  @OnEvent(UserEvent.USER_SIGNED_UP)
  async handleUserSignedUpEvent(payload: UserSignedUpEvent): Promise<void> {
    const { invitation_id } = payload.user;
    if (!invitation_id) {
      return;
    }
    await this.notificationsQueue.sendUserRegisteredNotification(payload);
  }

  @OnEvent(ScheduleEvent.SCHEDULE_ADDED)
  async handleScheduleAddedEvent(payload: ScheduleAddedEvent): Promise<void> {
    const { created_by, user_appointment_id, schedule_for, user_toolkit_id } =
      payload.schedule;
    if (!created_by) return;
    const user = await this.notificationsService.getUserById(created_by);
    if (user.role !== UserRoles.DOCTOR) {
      return;
    }
    if (user_appointment_id && schedule_for === ScheduleFor.APPOINTMENT) {
      await this.notificationsQueue.appointmentScheduleAddedNotificationJob(
        payload,
      );
    } else if (user_toolkit_id && schedule_for === ScheduleFor.USER_TOOLKIT) {
      await this.notificationsQueue.activityScheduleAddedNotificationJob(
        payload,
      );
    }
    return;
  }

  @OnEvent(TreatmentTimelineEvent.FILE_ADDED_IN_TREATMENT_TIMELINE)
  async handleTreatmentTimelineFileAddedEvent(
    payload: TreatmentTimelineFileAddedEvent,
  ): Promise<void> {
    const { timelineAttachment } = payload;
    const { created_by } = timelineAttachment;
    const user = await this.notificationsRepo.getUserById(created_by);
    if (user.role != UserRoles.DOCTOR) {
      return;
    }
    await this.notificationsQueue.addTreatmentTimelineFileAddedNotificationJob(
      payload,
    );
  }

  @OnEvent(ScheduleEvent.SEND_USER_APPOINTMENT_REMINDER)
  async handleUserAppointmentReminderNotificationEvent(
    payload: SendAppointmentReminderEvent,
  ): Promise<void> {
    await this.notificationsQueue.addUserAppointmentReminderNotificationJob(
      payload,
    );
  }

  @OnEvent(TreatmentsEvent.TREATMENT_CLOSED)
  async handleTreatmentClosedNotificationEvent(
    payload: TreatmentClosedEvent,
  ): Promise<void> {
    await this.notificationsQueue.addTreatmentClosedNotificationJob(payload);
  }

  @OnEvent(ScheduleSessionEvent.SESSION_ADDED)
  async handleSessionAddedEvent(
    payload: ScheduleSessionAddedEvent,
  ): Promise<void> {
    const { schedule_id } = payload.scheduleSession;
    const user = await this.notificationsRepo.getScheduleCreator(schedule_id);

    // Send notification to doctor only if the schedule is created by a doctor
    if (user && user.role === UserRoles.DOCTOR) {
      return await this.notificationsQueue.addToolkitPerformedNotificationsJob(
        payload,
      );
    }
  }

  @OnEvent(TreatmentTimelineEvent.TOOL_KIT_TIMELINE_MESSAGE_ADDED)
  async handleToolkitTimelineMessageAddedEvent(
    payload: ToolkitTimelineMessageAddedEvent,
  ): Promise<void> {
    await this.notificationsQueue.addToolkitTimelineMessageAddedNotificationJob(
      payload,
    );
  }

  @OnEvent(ScheduleEvent.SEND_USER_TOOLKIT_REMINDER)
  async handleUserToolkitReminderNotificationEvent(
    payload: SendUserToolkitReminderEvent,
  ): Promise<void> {
    await this.notificationsQueue.addUserToolkitReminderNotificationJob(
      payload,
    );
  }
}
