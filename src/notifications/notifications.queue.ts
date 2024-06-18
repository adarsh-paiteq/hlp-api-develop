import { BullModule, BullModuleOptions, InjectQueue } from '@nestjs/bull';
import { BadRequestException, Injectable } from '@nestjs/common';
import Bull, { Queue } from 'bull';
import * as OneSignal from '@onesignal/node-onesignal';
import {
  AgendaReminderData,
  CheckInReminderData,
  EngagementNotification,
} from './notifications.model';
import {
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
import { ScheduleReminder } from '../schedules/schedules.dto';
import { Checkin } from '../checkins/entities/check-ins.entity';
import { ChallengeEndedEvent } from '../challenges/challenges.event';
import { BonusAvailableEvent } from '../bonuses/bonuses.event';
import { Toolkit } from '../toolkits/toolkits.model';
import { defaultJobOptions } from '@core/configs/bull.config';
import { DateTime } from 'luxon';
import {
  GroupVideoCallInitiatedEvent,
  VideoCallInitiatedEvent,
} from '../video-calls/video-calls.event';
import {
  GroupMemberAddedEvent,
  GroupOwnerAddedEvent,
  groupInvitationCreatedEvent,
} from '../groups/groups.events';
import {
  TreatmentAddedEvent,
  TreatmentClosedEvent,
  TreatmentTeamCoachAddedEvent,
} from '@treatments/treatments.event';
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
export const NOTIFICATIONS_QUEUE = 'notifications';
export const notificationsQueueConfig: BullModuleOptions = {
  name: NOTIFICATIONS_QUEUE,
  defaultJobOptions: defaultJobOptions,
};

export enum notificationsJob {
  SEND_NOTIFICATION = '[NOTIFICATIONS] SEND NOTIFICATION',
  CHECK_ENGAGEMENT_NOTIFICATION = '[NOTIFICATIONS] CHECK ENGAGEMENT NOTIFICATION',
  SEND_ENGAGEMENT_NOTIFICATION = '[NOTIFICATIONS] SEND ENGAGEMENT NOTIFICATION',
  SEND_POST_LIKED_NOTIFICATION = '[NOTIFICATIONS] SEND_POST_LIKED_NOTIFICATION',
  SEND_FRIEND_FOLLOWED_NOTIFICATION = '[NOTIFICATIONS] SEND_FRIEND_FOLLOWED_NOTIFICATION',
  SEND_CHECK_IN_REMINDER_NOTIFICATION = '[NOTIFICATIONS] SEND CHECK IN REMINDER NOTIFICATION',
  SEND_AGENDA_REMINDER_NOTIFICATION = '[NOTIFICATIONS] SEND AGENDA REMINDER NOTIFICATION',
  SEND_HLP_DONATED_NOTIFICATION = '[NOTIFICATIONS] SEND_HLP_DONATED_NOTIFICATION',
  SEND_CHALLENGE_ENDED_NOTIFICATION = '[NOTIFICATIONS] SEND_CHALLENGE_ENDED_NOTIFICATION',
  SEND_INACTIVITY_NOTIFICATION = '[NOTIFICATIONS] SEND_INACTIVITY_NOTIFICATION',
  SEND_BONUS_AVAILABLE_NOTIFICATION = '[NOTIFICATIONS] SEND_BONUS_AVAILABLE_NOTIFICATION',
  SEND_POST_REACTION_NOTIFICATION = '[NOTIFICATIONS] SEND_POST_REACTION_NOTIFICATION',
  SEND_POST_THANK_YOY_NOTIFICATION = '[NOTIFICATIONS] SEND_POST_THANK_YOY_NOTIFICATION',
  LATE_CHECK_IN_REMINDER_NOTIFICATION = '[NOTIFICATION] LATE_CHECK_IN_REMINDER_NOTIFICATION',
  SEND_VIDEO_CALL_NOTIFICATION = '[NOTIFICATIONS] SEND VIDEO CALL NOTIFICATION',
  PREPARE_GROUP_VIDEO_CALL_NOTIFICATIONS = '[NOTIFICATIONS] PREPARE GROUP VIDEO CALL NOTIFICATIONS',
  SEND_GROUP_INVITATION_NOTIFICATION = '[NOTIFICATIONS] SEND_GROUP_INVITATION_NOTIFICATION',
  SEND_FRIEND_REQUEST_NOTIFICATION = '[NOTIFICATIONS] SEND_FRIEND_REQUEST_NOTIFICATION',
  SEND_COACH_ADDED_NOTIFICATION = '[NOTIFICATIONS] SEND_COACH_ADDED_NOTIFICATION',
  COACH_ADDED_TO_GROUP_NOTIFICATION = '[NOTIFICATIONS] COACH ADDED TO GROUP NOTIFICATION',
  TREATMENT_ADDED_NOTIFICATION = '[NOTIFICATIONS] TREATMENT ADDED NOTIFICATION',
  TREATMENT_TIMELINE_NOTE_ADDED_NOTIFICATION = '[NOTIFICATIONS] TREATMENT TIMELINE NOTE ADDED NOTIFICATION',
  SEND_USER_REGISTERED_NOTIFICATION = '[NOTIFICATIONS] SEND USER REGISTERED NOTIFICATION',
  APPOINTMENT_SCHEDULE_ADDED_NOTIFICATION = '[NOTIFICATIONS] APPOINTMENT SCHEDULE ADDED NOTIFICATION',
  TREATMENT_TIMELINE_FILE_ADDED_NOTIFICATION = '[NOTIFICATIONS] TREATMENT TIMELINE FILE ADDED NOTIFICATION',
  ACTIVITY_SCHEDULE_ADDED_NOTIFICATION = '[NOTIFICATIONS] ACTIVITY SCHEDULE ADDED NOTIFICATION',
  SEND_USER_APPOINTMENT_REMINDER_NOTIFICATION = '[NOTIFICATIONS] SEND USER APPOINTMENT REMINDER NOTIFICATION',
  SEND_TOOLKIT_PERFORMED_NOTIFICATION = '[NOTIFICATIONS] SEND TOOLKIT PERFORMED NOTIFICATION',
  SEND_TREATMENT_CLOSED_NOTIFICATION = '[NOTIFICATIONS] SEND TREATMENT CLOSED NOTIFICATION',
  SEND_GROUP_MEMBER_ADDED_NOTIFICATION = '[NOTIFICATIONS] SEND GROUP MEMBER ADDED NOTIFICATION',
  SEND_TOOLKIT_TIMELINE_MESSAGE_ADDED_NOTIFICATION = '[NOTIFICATIONS] SEND TOOLKIT TIMELINE MESSAGE ADDED NOTIFICATION',
  SEND_USER_TOOLKIT_REMINDER_NOTIFICATION = '[NOTIFICATIONS] SEND SEND_USER_TOOLKIT_REMINDER_NOTIFICATION',
}

export const registerNotificationsQueue = BullModule.registerQueue(
  notificationsQueueConfig,
);

@Injectable()
export class NotificationsQueue {
  constructor(
    @InjectQueue(NOTIFICATIONS_QUEUE)
    private readonly notificationsQueue: Queue,
  ) {}

  async sendNotification(notification: OneSignal.Notification): Promise<void> {
    await this.notificationsQueue.add(
      notificationsJob.SEND_NOTIFICATION,
      notification,
    );
  }

  async addEngagementJob(cron: string): Promise<{ response: string }> {
    const otps: Bull.JobOptions = {
      repeat: {
        cron: cron,
        tz: 'Europe/London',
      },
    };
    const { name, id } = await this.notificationsQueue.add(
      notificationsJob.CHECK_ENGAGEMENT_NOTIFICATION,
      null,
      otps,
    );
    if (!id) {
      throw new BadRequestException(`Failed to add Job`);
    }
    return { response: `${name}, Added Successfully` };
  }

  async removeEngagementJob(): Promise<{ response: string }> {
    const jobs = await this.notificationsQueue.getRepeatableJobs();
    if (!jobs.length) {
      return { response: 'No Repeatable jobs to remove' };
    }
    const job = jobs.find(
      ($job) => notificationsJob.CHECK_ENGAGEMENT_NOTIFICATION === $job.name,
    );
    if (!job) {
      return { response: 'Job not added' };
    }
    await this.notificationsQueue.removeRepeatableByKey(job.key);
    return { response: `${job.name}, Removed Successfully` };
  }

  async sendEngagementNotification(
    engagementNotification: EngagementNotification,
  ): Promise<void> {
    await this.notificationsQueue.add(
      notificationsJob.SEND_ENGAGEMENT_NOTIFICATION,
      engagementNotification,
    );
  }

  async sendPostLikeNotification(
    postLikedNotification: ChannelPostLikeUpdatedEvent,
  ): Promise<void> {
    await this.notificationsQueue.add(
      notificationsJob.SEND_POST_LIKED_NOTIFICATION,
      postLikedNotification,
    );
  }

  async sendFriendFollowedNotification(
    friendFollowedNotification: FriendFollowedEvent,
  ): Promise<void> {
    await this.notificationsQueue.add(
      notificationsJob.SEND_FRIEND_FOLLOWED_NOTIFICATION,
      friendFollowedNotification,
    );
  }

  async sendCheckInReminderNotification(
    scheduleReminder: ScheduleReminder,
    checkIn: Checkin,
  ): Promise<void> {
    const data: CheckInReminderData = {
      scheduleReminder: scheduleReminder,
      checkIn: checkIn,
    };
    await this.notificationsQueue.add(
      notificationsJob.SEND_CHECK_IN_REMINDER_NOTIFICATION,
      data,
    );
  }

  async addLateCheckInReminderNotification(
    scheduleReminder: ScheduleReminder,
    checkIn: Checkin,
  ): Promise<void> {
    const data: CheckInReminderData = {
      scheduleReminder: scheduleReminder,
      checkIn: checkIn,
    };
    const start = DateTime.fromJSDate(new Date()).toUTC();
    const end = start.plus({ days: 1 });
    const { milliseconds: delay } = end.diff(start).toObject();
    const opts = {
      delay: delay,
    };
    await this.notificationsQueue.add(
      notificationsJob.LATE_CHECK_IN_REMINDER_NOTIFICATION,
      data,
      opts,
    );
  }

  async sendAgendaReminderNotification(
    scheduleReminder: ScheduleReminder,
    agenda: Toolkit,
  ): Promise<void> {
    const data: AgendaReminderData = {
      scheduleReminder: scheduleReminder,
      agenda: agenda,
    };
    await this.notificationsQueue.add(
      notificationsJob.SEND_AGENDA_REMINDER_NOTIFICATION,
      data,
    );
  }

  async addInactivityNotificationJob(
    cron: string,
  ): Promise<{ response: string }> {
    const otps: Bull.JobOptions = {
      repeat: {
        cron: cron,
        tz: 'Europe/London',
      },
    };
    const { name, id } = await this.notificationsQueue.add(
      notificationsJob.SEND_INACTIVITY_NOTIFICATION,
      null,
      otps,
    );
    if (!id) {
      throw new BadRequestException(`Failed to add Job`);
    }
    return { response: `${name}, Added Successfully` };
  }

  async removeInactivityNotificationJob(): Promise<{ response: string }> {
    const jobs = await this.notificationsQueue.getRepeatableJobs();
    if (!jobs.length) {
      return { response: 'No Repeatable jobs to remove' };
    }
    const job = jobs.find(
      ($job) => notificationsJob.SEND_INACTIVITY_NOTIFICATION === $job.name,
    );
    if (!job) {
      return { response: 'Job not added' };
    }
    await this.notificationsQueue.removeRepeatableByKey(job.key);
    return { response: `${job.name}, Removed Successfully` };
  }

  async sendChallengeEndedNotification(
    payload: ChallengeEndedEvent,
  ): Promise<void> {
    await this.notificationsQueue.add(
      notificationsJob.SEND_CHALLENGE_ENDED_NOTIFICATION,
      payload,
    );
  }

  async sendHlpDonatedNotification(
    payload: HLPPointsDonatedEvent,
  ): Promise<void> {
    await this.notificationsQueue.add(
      notificationsJob.SEND_HLP_DONATED_NOTIFICATION,
      payload,
    );
  }

  async sendBonusAvailableNotification(
    nextBonus: BonusAvailableEvent,
  ): Promise<void> {
    await this.notificationsQueue.add(
      notificationsJob.SEND_BONUS_AVAILABLE_NOTIFICATION,
      nextBonus,
    );
  }

  async sendPostReactionNotification(
    payload: PostReactionAddedEvent,
  ): Promise<void> {
    await this.notificationsQueue.add(
      notificationsJob.SEND_POST_REACTION_NOTIFICATION,
      payload,
    );
  }

  async sendPostThankYouNotification(
    payload: PostThankYouEvent,
  ): Promise<void> {
    await this.notificationsQueue.add(
      notificationsJob.SEND_POST_THANK_YOY_NOTIFICATION,
      payload,
    );
  }

  async addVideoCallNotificationJob(
    payload: VideoCallInitiatedEvent,
  ): Promise<void> {
    await this.notificationsQueue.add(
      notificationsJob.SEND_VIDEO_CALL_NOTIFICATION,
      payload,
    );
  }

  async addPrepareGroupVideoCallNotificationsJob(
    payload: GroupVideoCallInitiatedEvent,
  ): Promise<void> {
    await this.notificationsQueue.add(
      notificationsJob.PREPARE_GROUP_VIDEO_CALL_NOTIFICATIONS,
      payload,
    );
  }

  async addGroupInvitationNotificationJob(
    groupInvitationNotification: groupInvitationCreatedEvent,
  ): Promise<void> {
    await this.notificationsQueue.add(
      notificationsJob.SEND_GROUP_INVITATION_NOTIFICATION,
      groupInvitationNotification,
    );
  }

  async addFriendRequestNotificationJob(
    payload: FriendRequestCreatedEvent,
  ): Promise<void> {
    await this.notificationsQueue.add(
      notificationsJob.SEND_FRIEND_REQUEST_NOTIFICATION,
      payload,
    );
  }

  async addCoachAddedNotificationsJob(
    payload: TreatmentTeamCoachAddedEvent,
  ): Promise<void> {
    await this.notificationsQueue.add(
      notificationsJob.SEND_COACH_ADDED_NOTIFICATION,
      payload,
    );
  }

  async addCoachGroupNotificationJob(
    payload: GroupOwnerAddedEvent,
  ): Promise<void> {
    await this.notificationsQueue.add(
      notificationsJob.COACH_ADDED_TO_GROUP_NOTIFICATION,
      payload,
    );
  }

  async addTreatmentAddedNotificationJob(
    payload: TreatmentAddedEvent,
  ): Promise<void> {
    await this.notificationsQueue.add(
      notificationsJob.TREATMENT_ADDED_NOTIFICATION,
      payload,
    );
  }

  async addTimelineNoteAddedNotificationJob(
    payload: TreatmentTimelineNoteAddedEvent,
  ): Promise<void> {
    await this.notificationsQueue.add(
      notificationsJob.TREATMENT_TIMELINE_NOTE_ADDED_NOTIFICATION,
      payload,
    );
  }

  async sendUserRegisteredNotification(
    payload: UserSignedUpEvent,
  ): Promise<void> {
    await this.notificationsQueue.add(
      notificationsJob.SEND_USER_REGISTERED_NOTIFICATION,
      payload,
    );
  }

  async appointmentScheduleAddedNotificationJob(
    payload: ScheduleAddedEvent,
  ): Promise<void> {
    await this.notificationsQueue.add(
      notificationsJob.APPOINTMENT_SCHEDULE_ADDED_NOTIFICATION,
      payload,
    );
  }

  async addTreatmentTimelineFileAddedNotificationJob(
    payload: TreatmentTimelineFileAddedEvent,
  ): Promise<void> {
    await this.notificationsQueue.add(
      notificationsJob.TREATMENT_TIMELINE_FILE_ADDED_NOTIFICATION,
      payload,
    );
  }

  async activityScheduleAddedNotificationJob(
    payload: ScheduleAddedEvent,
  ): Promise<void> {
    await this.notificationsQueue.add(
      notificationsJob.ACTIVITY_SCHEDULE_ADDED_NOTIFICATION,
      payload,
    );
  }

  async addUserAppointmentReminderNotificationJob(
    payload: SendAppointmentReminderEvent,
  ): Promise<void> {
    await this.notificationsQueue.add(
      notificationsJob.SEND_USER_APPOINTMENT_REMINDER_NOTIFICATION,
      payload,
    );
  }

  async addTreatmentClosedNotificationJob(
    payload: TreatmentClosedEvent,
  ): Promise<void> {
    await this.notificationsQueue.add(
      notificationsJob.SEND_TREATMENT_CLOSED_NOTIFICATION,

      payload,
    );
  }

  async sendGroupMemberAddedNotificationJob(
    payload: GroupMemberAddedEvent,
  ): Promise<void> {
    await this.notificationsQueue.add(
      notificationsJob.SEND_GROUP_MEMBER_ADDED_NOTIFICATION,
      payload,
    );
  }

  async addToolkitPerformedNotificationsJob(
    payload: ScheduleSessionAddedEvent,
  ): Promise<void> {
    await this.notificationsQueue.add(
      notificationsJob.SEND_TOOLKIT_PERFORMED_NOTIFICATION,
      payload,
    );
  }

  async addToolkitTimelineMessageAddedNotificationJob(
    payload: ToolkitTimelineMessageAddedEvent,
  ): Promise<void> {
    await this.notificationsQueue.add(
      notificationsJob.SEND_TOOLKIT_TIMELINE_MESSAGE_ADDED_NOTIFICATION,
      payload,
    );
  }

  async addUserToolkitReminderNotificationJob(
    payload: SendUserToolkitReminderEvent,
  ): Promise<void> {
    await this.notificationsQueue.add(
      notificationsJob.SEND_USER_TOOLKIT_REMINDER_NOTIFICATION,
      payload,
    );
  }
}
