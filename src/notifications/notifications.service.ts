import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  FriendFollowedEvent,
  HLPPointsDonatedEvent,
} from '../users/user.event';
import {
  ChannelPostLikeUpdatedEvent,
  PostReactionAddedEvent,
  PostThankYouEvent,
} from '../channels/channels.event';
import {
  NotificationCreatedEvent,
  NotificationEvent,
  SendEngagementNotificationEvent,
  VideoCallNotificationSentEvent,
} from './notifications.event';
import {
  AgendaReminderData,
  EngagementNotification,
  CheckInReminderData,
  ReminderNotificationData,
  GetAndroidNotificationChannel,
} from './notifications.model';
import { ChallengeEndedEvent } from '../challenges/challenges.event';
import { Bonus } from '../bonuses/bonuses.dto';
import {
  OneSignalSegments,
  OneSignalService,
} from '@shared/services/one-signal/one-signal';
import { DateTime } from 'luxon';
import { Toolkit, ToolkitType } from '../toolkits/toolkits.model';
import { ScheduleReminder } from '../schedules/schedules.dto';
import {
  SaveUserNotificationDto,
  UserNotificationSettingInput,
} from './dto/notifications.dto';
import { UserNotificationSettings, UserRoles } from '../users/users.dto';
import {
  NotificationMetadata,
  UserNotification,
  UserNotificationType,
} from './entities/user-notifications.entity';
import { PaginationArgs } from '@shared/dto/pagination-params.dto';
import { GetUserNotificationResponse } from './dto/get-notifications.dto';
import { getISODate } from '../utils/util';
import {
  GroupVideoCallInitiatedEvent,
  VideoCallInitiatedEvent,
} from '@video-calls/video-calls.event';
import { VideoCallsRepo } from '@video-calls/video-calls.repo';
import { VideoCallMemberStatus } from '@video-calls/entities/video-call-members.entity';
import { SaveVideoCallMemberInput } from '@video-calls/dto/generate-video-call-token.dto';
import { VideoCallsService } from '@video-calls/video-calls.service';
import { VideoCallNotificactionPayload } from '@video-calls/dto/video-calls.dto';
import { Doctor } from '@doctors/entities/doctors.entity';
import { ChannelInvitation } from '@groups/entities/channel-invitations.entity';
import { UserFriendRequest } from '@users/entities/user-friend-request.entity';
import { ChatType } from '@chats/entities/chat.entity';
import {
  DoctorNotificationArgs,
  GetDoctorNotificationResponse,
} from './dto/get-doctor-notifications.dto';
import { Server as SocketIOServer } from 'socket.io';
import { WEBSOCKET_CLIENT_EVENT } from '@core/constants';
import { DoctorTreatment } from '@treatments/entities/doctor-treatments.entity';
import { UserChannel } from '@channels/entities/user-channel.entity';
import { Channel } from '@channels/entities/channel.entity';
import { Users } from '@users/users.model';
import { PaitentInvitationStatus } from '@invitations/entities/patient-invitations.entity';
import { ScheduleEntity } from '@schedules/entities/schedule.entity';
import { RedisService } from '@core/modules/redis/redis.service';
import {
  TreatmentAddedEvent,
  TreatmentClosedEvent,
} from '@treatments/treatments.event';
import { NotificationsContent } from './notifications-content';
import {
  ToolkitTimelineMessageAddedEvent,
  TreatmentTimelineFileAddedEvent,
  TreatmentTimelineNoteAddedEvent,
} from '@treatment-timeline/treatment-timeline.event';
import { NotificationsRepo } from './notifications.repo';
import { NotificationsQueue } from './notifications.queue';
import {
  SendAppointmentReminderEvent,
  SendUserToolkitReminderEvent,
} from '@schedules/schedule.event';
import { NotificationSound } from './enums/notification.enum';
import { TranslationService } from '@shared/services/translation/translation.service';
import { ScheduleSessionDto } from '@schedule-sessions/schedule-sessions.dto';
import { SchedulesService } from '@schedules/schedules.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  constructor(
    private readonly notificationsQueue: NotificationsQueue,
    private readonly notificationsRepo: NotificationsRepo,
    private readonly eventEmitter: EventEmitter2,
    private readonly notificationContent: NotificationsContent,
    private readonly oneSignalService: OneSignalService,
    private readonly videoCallsService: VideoCallsService,
    private readonly videoCallsRepo: VideoCallsRepo,
    private readonly redisService: RedisService,
    private readonly translationService: TranslationService,
    private readonly scheduleService: SchedulesService,
  ) {}

  async checkCommunityNotificationSetting(userId: string): Promise<boolean> {
    const notificationSettings =
      await this.notificationsRepo.getUserNotificationSettings(userId);
    if (!notificationSettings) {
      throw new NotFoundException('Notification Setting not Found');
    }
    return notificationSettings.allow_community_push_notification;
  }

  async addEngagementNotification(cron: string): Promise<{ response: string }> {
    return this.notificationsQueue.addEngagementJob(cron);
  }

  async removeEngagementNotification(): Promise<{ response: string }> {
    return this.notificationsQueue.removeEngagementJob();
  }

  async checkEngagementNotification(): Promise<string> {
    const [date] = new Date().toISOString().split('T');
    const notification = await this.notificationsRepo.getEngagementNotification(
      date,
    );
    if (!notification) {
      return `Engagement Notification not found on ${date}`;
    }
    this.eventEmitter.emit(
      NotificationEvent.SEND_ENGAGEMENT_NOTIFICATION,
      new SendEngagementNotificationEvent(notification),
    );
    return 'OK';
  }

  async sendEngagementNotification(
    engagementNotification: EngagementNotification,
  ): Promise<string> {
    const { body, title } = engagementNotification;
    const notification = this.oneSignalService.prepareNotification(
      {},
      body,
      title,
    );
    const result = await this.oneSignalService.sendPushNotificationToSegments(
      notification,
      [OneSignalSegments.SUBSCRIBED_USERS],
    );
    if (!result.id) {
      return `Failed to Send  Video Call Notification. ${JSON.stringify(
        result.errors,
      )} `;
    }
    return `Engagement Notification Sent to ${result.recipients} recipients`;
  }

  async sendPostLikedNotification(
    postalikedNotification: ChannelPostLikeUpdatedEvent,
  ): Promise<string> {
    const {
      channelPostLike: { user_id, post_id, channel_id },
    } = postalikedNotification;
    const [postOwner, postLiker, channel] = await Promise.all([
      this.notificationsRepo.getUserByPostId(post_id),
      this.notificationsRepo.getUserById(user_id),
      this.notificationsRepo.getChannelById(channel_id),
    ]);
    if (!postOwner) {
      throw new NotFoundException('User not found');
    }
    const { id: postOwnerId } = postOwner;
    const { id: postLikerId, user_name, first_name, last_name } = postLiker;
    const postLikerName = `${first_name} ${last_name}`;

    if (postOwnerId === postLikerId) {
      return `Notification not sent because like is from post owner`;
    }
    const isEnable = await this.checkCommunityNotificationSetting(postOwnerId);
    if (!isEnable) {
      return 'Community push notifications disabled';
    }

    const { contents, data, headings, translations } =
      postOwner.role == UserRoles.USER
        ? this.notificationContent.preparePostLikeNotificationContent(
            user_name as string,
            channel,
            post_id,
          )
        : this.notificationContent.preparePostLikedDoctorNotificationContent(
            postLikerName,
            channel,
          );

    const metadata: NotificationMetadata = {
      channel_id: channel.id,
      post_id,
    };

    const saveUserNotification: SaveUserNotificationDto = {
      user_id: postOwnerId,
      title: translations[postLiker.language].title,
      body: translations[postLiker.language].body,
      account_id: postLikerId,
      page: data.page,
      type: UserNotificationType.POST_LIKED,
      metadata,
      translations,
    };

    const saveNotification = await this.notificationsRepo.saveUserNotifications(
      saveUserNotification,
    );

    if (postOwner.role == UserRoles.USER) {
      const notification = this.oneSignalService.prepareOneSignalNotification(
        data,
        contents,
        headings,
      );

      const result =
        await this.oneSignalService.sendPushNotificationToExternalUserIds(
          notification,
          [postOwnerId],
        );
      return `Post like Notification Sent ${result}`;
    }

    if (postOwner.role == UserRoles.DOCTOR) {
      this.eventEmitter.emit(
        NotificationEvent.NOTIFICATION_CREATED,
        new NotificationCreatedEvent(saveNotification),
      );
      return `Post liked Socket Notification Sent `;
    }
    return `Failed To send Post Liked Notification`;
  }

  async sendFriendFollowedNotification(
    payload: FriendFollowedEvent,
  ): Promise<string> {
    const {
      friendFollowed: { user_id, friend_id },
    } = payload;
    const isEnable = await this.checkCommunityNotificationSetting(user_id);
    if (!isEnable) {
      return 'Community push notifications disabled';
    }
    const user = await this.notificationsRepo.getUserById(friend_id);
    if (!user) {
      return 'User not found';
    }
    const { user_name } = user;

    const { data, contents, headings, translations } =
      this.notificationContent.prepareFriendFollewedNotificationContent(
        user_name as string,
        friend_id,
      );

    const saveUserNotification: SaveUserNotificationDto = {
      user_id: user_id,
      title: translations[user.language].title,
      body: translations[user.language].body,
      account_id: friend_id,
      page: data.page,
      translations,
    };
    await this.notificationsRepo.saveUserNotifications(saveUserNotification);

    const notification = this.oneSignalService.prepareOneSignalNotification(
      data,
      contents,
      headings,
    );

    const result =
      await this.oneSignalService.sendPushNotificationToExternalUserIds(
        notification,
        [user_id],
      );

    if (!result.id) {
      return `Failed to Send Notification. ${JSON.stringify(result.errors)} `;
    }
    return `Friend Followed Notification Sent ${JSON.stringify(result)}`;
  }

  async sendCheckInReminderNotification(
    checkInReminderData: CheckInReminderData,
  ): Promise<string> {
    const {
      scheduleReminder,
      checkIn: { title, tool_kit_id },
    } = checkInReminderData;
    const { user_id } = scheduleReminder;
    const user = await this.notificationsRepo.getUserById(user_id);
    if (!user) {
      return 'User not found';
    }
    const userNotificationSettings =
      await this.notificationsRepo.getUserNotificationSettings(user_id);
    const { allow_reminder_push_notification, reminder_sound: reminderSound } =
      userNotificationSettings;
    if (!allow_reminder_push_notification) {
      return 'Reminder Push Notifications are Disabled';
    }

    const toolKit = await this.notificationsRepo.getToolkitById(tool_kit_id);
    if (!toolKit) {
      throw new NotFoundException('Toolkit not found');
    }
    const reminderNotificationData = await this.getReminderNotificationData(
      scheduleReminder,
      toolKit,
    );
    reminderNotificationData.title = title;
    const { data, contents, headings, translations } =
      this.notificationContent.prepareCheckInReminderNotificationContent(
        reminderNotificationData,
      );
    const saveUserNotification: SaveUserNotificationDto = {
      user_id: user_id,
      title: translations[user.language].title,
      body: translations[user.language].body,
      page: data.page,
      translations,
    };
    await this.notificationsRepo.saveUserNotifications(saveUserNotification);

    const notification = this.oneSignalService.prepareOneSignalNotification(
      data,
      contents,
      headings,
      reminderSound,
    );
    const result =
      await this.oneSignalService.sendPushNotificationToExternalUserIds(
        notification,
        [user_id],
      );

    if (!result.id) {
      return `Failed to Send Notification. ${JSON.stringify(result.errors)} `;
    }
    return `Check-in Reminder Notification Sent to ${JSON.stringify(result)}`;
  }

  isScheduledDisableByUser(date: string): boolean {
    const currentDate = getISODate(new Date());
    const endDate = getISODate(new Date(date));
    return endDate <= currentDate;
  }

  async sendLateCheckInReminderNotification(
    checkInReminderData: CheckInReminderData,
  ): Promise<string> {
    const {
      scheduleReminder,
      checkIn: { id: checkInId, title, tool_kit_id },
    } = checkInReminderData;
    const { user_id, schedule_id } = scheduleReminder;
    const user = await this.notificationsRepo.getUserById(user_id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const userNotificationSettings =
      await this.notificationsRepo.getUserNotificationSettings(user_id);
    const { allow_reminder_push_notification, reminder_sound: reminderSound } =
      userNotificationSettings;
    if (!allow_reminder_push_notification) {
      return 'Reminder Push Notifications are Disabled';
    }

    const schedule = await this.notificationsRepo.getScheduleById(schedule_id);
    if (!schedule) {
      throw new NotFoundException(`Schedule not found`);
    }
    const { is_schedule_disabled, end_date } = schedule;
    let isScheduleDisabled = is_schedule_disabled;

    if (is_schedule_disabled && end_date) {
      isScheduleDisabled = this.isScheduledDisableByUser(end_date as string);
    }

    if (isScheduleDisabled) {
      return 'Schedule is disabled by user';
    }
    const sessionDate = DateTime.fromJSDate(new Date())
      .toUTC()
      .minus({ days: 1 })
      .toISODate() as string;

    const userSessions = await this.notificationsRepo.getUserScheduleSession(
      schedule_id,
      user_id,
      checkInId,
      sessionDate,
    );
    if (userSessions) {
      return `Check-in Performed By user`;
    }
    const toolKit = await this.notificationsRepo.getToolkitById(tool_kit_id);
    if (!toolKit) {
      throw new NotFoundException('Toolkit not found');
    }
    const reminderNotificationData = await this.getReminderNotificationData(
      scheduleReminder,
      toolKit,
    );
    reminderNotificationData.title = title;
    const { data, contents, headings, translations } =
      this.notificationContent.prepareLateCheckInReminderNotificationContent(
        reminderNotificationData,
      );

    const saveUserNotification: SaveUserNotificationDto = {
      user_id: user_id,
      title: translations[user.language].title,
      body: translations[user.language].body,
      page: data.page,
      translations,
    };
    await this.notificationsRepo.saveUserNotifications(saveUserNotification);

    const notification = this.oneSignalService.prepareOneSignalNotification(
      data,
      contents,
      headings,
      reminderSound,
    );
    const result =
      await this.oneSignalService.sendPushNotificationToExternalUserIds(
        notification,
        [user_id],
      );

    if (!result.id) {
      return `Failed to Send Notification. ${JSON.stringify(result.errors)} `;
    }
    return `Late Check-in Reminder Notification Sent ${JSON.stringify(result)}`;
  }

  async getReminderNotificationData(
    scheduleReminder: ScheduleReminder,
    toolkit: Toolkit,
  ): Promise<ReminderNotificationData> {
    const { schedule_id: scheduleId, user_id: userId } = scheduleReminder;
    const {
      id: toolkitId,
      goal_id,
      title,
      tool_kit_category,
      tool_kit_type,
      translations,
    } = toolkit;

    const [challenge, userGoal, session, habitDay] = await Promise.all([
      this.notificationsRepo.getActiveChallengeByToolkit(toolkitId, userId),
      this.notificationsRepo.getUserGoalsByGoalId(goal_id, userId),
      this.notificationsRepo.getSessionDateByScheduleId(scheduleId, userId),
      this.notificationsRepo.getUserHabitDayById(scheduleId, toolkitId),
    ]);

    let challengeId,
      goalId,
      isUserJoinedChallenge,
      dayId,
      day,
      sessionDate = getISODate(new Date());
    if (challenge) {
      challengeId = challenge.id;
      isUserJoinedChallenge = challenge.is_user_joined_challenge;
    }
    if (userGoal) {
      goalId = userGoal.goal;
    }

    if (session) {
      sessionDate = getISODate(new Date(session.session_date));
    }
    if (habitDay) {
      day = habitDay.day;
      dayId = habitDay.id;
    }
    const reminderNotificationData: ReminderNotificationData = {
      title: title,
      scheduleId: scheduleId,
      sessionDate: sessionDate,
      toolkitCategoryId: tool_kit_category,
      toolkitId: toolkitId,
      toolkitType: tool_kit_type as ToolkitType,
      challengeId: challengeId,
      goalId: goalId,
      isUserJoinedChallenge: isUserJoinedChallenge,
      day: day,
      dayId: dayId,
      translations,
    };
    return reminderNotificationData;
  }

  async sendAgendaReminderNotification(
    agendaReminderData: AgendaReminderData,
  ): Promise<string> {
    const { scheduleReminder, agenda } = agendaReminderData;
    const { user_id } = scheduleReminder;
    const user = await this.notificationsRepo.getUserById(user_id);
    if (!user) {
      return 'User not found';
    }

    const userNotificationSettings =
      await this.notificationsRepo.getUserNotificationSettings(user_id);
    const { allow_reminder_push_notification, reminder_sound: reminderSound } =
      userNotificationSettings;
    if (!allow_reminder_push_notification) {
      return 'Reminder Push Notifications are Disabled';
    }

    const reminderNotificationData = await this.getReminderNotificationData(
      scheduleReminder,
      agenda,
    );

    const { data, contents, headings, translations } =
      this.notificationContent.prepareAgendaReminderNotificationContent(
        reminderNotificationData,
        scheduleReminder.reminder_time,
      );

    const saveUserNotification: SaveUserNotificationDto = {
      user_id: user_id,
      title: translations[user.language].title,
      body: translations[user.language].body,
      page: data.page,
      translations,
    };
    await this.notificationsRepo.saveUserNotifications(saveUserNotification);

    const notification = this.oneSignalService.prepareOneSignalNotification(
      data,
      contents,
      headings,
      reminderSound,
    );
    const result =
      await this.oneSignalService.sendPushNotificationToExternalUserIds(
        notification,
        [user_id],
      );

    if (!result.id) {
      return `Failed to Send Notification. ${JSON.stringify(result.errors)} `;
    }
    return `Agenda Reminder Notification Sent ${JSON.stringify(result)}`;
  }

  async addInactivityNotification(cron: string): Promise<{ response: string }> {
    return this.notificationsQueue.addInactivityNotificationJob(cron);
  }

  async removeInactivityNotification(): Promise<{ response: string }> {
    return this.notificationsQueue.removeInactivityNotificationJob();
  }

  async sendInactivityNotification(): Promise<string> {
    const { contents, headings, data } =
      this.notificationContent.prepareInactivityNotificationContent();

    const notification = this.oneSignalService.prepareOneSignalNotification(
      data,
      contents,
      headings,
    );
    const result = await this.oneSignalService.sendPushNotificationToSegments(
      notification,
      [OneSignalSegments.INACTIVE_USERS],
    );
    if (!result.id) {
      return `Failed to Send Notification. ${JSON.stringify(result.errors)} `;
    }
    return `Inactivity Notification Sent ${JSON.stringify(result)}`;
  }

  async sendChallengeEndedNotification(
    payload: ChallengeEndedEvent,
  ): Promise<string> {
    const {
      challenge: { id },
    } = payload;
    const userIds = await this.notificationsRepo.getUsersIdsByChallengeId(id);
    const challenge = await this.notificationsRepo.getChallengeById(id);
    const maxLmit = 2000;
    const chunks = Array(Math.ceil(userIds.length / maxLmit))
      .fill(1)
      .map(() => userIds.splice(0, maxLmit));
    const { data, contents, headings } =
      this.notificationContent.prepareChallengeEndedNotificationContent(
        challenge,
        id,
      );
    const notification = this.oneSignalService.prepareOneSignalNotification(
      data,
      contents,
      headings,
    );
    const response = [];
    for (const chunk of chunks) {
      const result =
        await this.oneSignalService.sendPushNotificationToExternalUserIds(
          notification,
          chunk,
        );
      response.push(result);
    }
    return `Challenge Ended Notification Sent. Response: ${JSON.stringify(
      response,
    )}`;
  }

  async sendHlpDonatedNotification(
    payload: HLPPointsDonatedEvent,
  ): Promise<string> {
    const {
      donation: { donor_user_id, receiver_user_id, hlp_reward_points_donated },
    } = payload;
    const user = await this.notificationsRepo.getUserById(donor_user_id);
    if (!user) {
      return 'User not found';
    }
    const { user_name } = user;
    const { data, contents, headings, translations } =
      this.notificationContent.prepareHlpDonatedNotificationContent(
        user_name as string,
        hlp_reward_points_donated,
        donor_user_id,
      );

    const saveUserNotification: SaveUserNotificationDto = {
      user_id: receiver_user_id,
      title: translations[user.language].title,
      body: translations[user.language].body,
      page: data.page,
      account_id: donor_user_id,
      translations,
    };
    await this.notificationsRepo.saveUserNotifications(saveUserNotification);

    const notification = this.oneSignalService.prepareOneSignalNotification(
      data,
      contents,
      headings,
    );
    const result =
      await this.oneSignalService.sendPushNotificationToExternalUserIds(
        notification,
        [receiver_user_id],
      );

    if (!result.id) {
      return `Failed to Send Notification. ${JSON.stringify(result.errors)} `;
    }
    return `Hlp Donated Notification Sent ${JSON.stringify(result)}`;
  }

  async sendBonusAvailableNotification(nextBonus: Bonus): Promise<string> {
    const { user_id } = nextBonus;
    const user = await this.notificationsRepo.getUserById(user_id);
    if (!user) {
      return 'User not found';
    }

    const { data, contents, headings, translations } =
      this.notificationContent.prepareBonusAvailableNotificationContent();

    const saveUserNotification: SaveUserNotificationDto = {
      user_id: user_id,
      title: translations[user.language].title,
      body: translations[user.language].body,
      page: data.page,
      translations,
    };

    await this.notificationsRepo.saveUserNotifications(saveUserNotification);

    const notification = this.oneSignalService.prepareOneSignalNotification(
      data,
      contents,
      headings,
    );

    const result =
      await this.oneSignalService.sendPushNotificationToExternalUserIds(
        notification,
        [user_id],
      );
    if (!result.id) {
      return `Failed to Send Notification. ${JSON.stringify(result.errors)} `;
    }
    return `Bonus Available Notification Sent ${JSON.stringify(result)}`;
  }

  async sendPostReactionNotification(
    payload: PostReactionAddedEvent,
  ): Promise<string> {
    const {
      user_id,
      post_id,
      channel_id,
      id: reactionId,
    } = payload.channelPostReaction;

    const { message, user_id: postOwnerId } =
      await this.notificationsRepo.getUserPostByPostId(post_id);
    const title = message.split(' ').slice(0, 3).join(' ');
    const isEnable = await this.checkCommunityNotificationSetting(postOwnerId);
    if (!isEnable) {
      return 'Community push notifications disabled';
    }
    if (postOwnerId === user_id) {
      return `Notification not sent because comment is from post owner`;
    }
    const [user, channel, postOwner] = await Promise.all([
      this.notificationsRepo.getUserById(user_id),
      this.notificationsRepo.getChannelById(channel_id),
      this.notificationsRepo.getUserById(postOwnerId),
    ]);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    let result;
    if (postOwner.role == UserRoles.USER) {
      const { data, contents, headings, translations } =
        this.notificationContent.preparePostReactionNotificationContent(
          user.user_name,
          title,
          channel,
          post_id,
        );

      const saveUserNotification: SaveUserNotificationDto = {
        user_id: postOwnerId,
        title: translations[user.language].title,
        body: translations[user.language].body,
        page: data.page,
        account_id: user_id,
        translations,
      };

      await this.notificationsRepo.saveUserNotifications(saveUserNotification);

      const notification = this.oneSignalService.prepareOneSignalNotification(
        data,
        contents,
        headings,
      );

      result =
        await this.oneSignalService.sendPushNotificationToExternalUserIds(
          notification,
          [postOwnerId],
        );
    } else if (postOwner.role == UserRoles.DOCTOR) {
      const { data, translations } =
        this.notificationContent.preparePostReactionDoctorNotificationContent(
          user.user_name,
          channel,
        );

      const metadata: NotificationMetadata = {
        reaction_id: reactionId,
        post_id,
        channel_id: channel.id,
      };

      const saveUserNotification: SaveUserNotificationDto = {
        user_id: postOwnerId,
        title: translations[user.language].title,
        body: translations[user.language].body,
        page: data.page,
        type: UserNotificationType.POST_REACTION,
        metadata,
        translations,
      };

      const saveNotification =
        await this.notificationsRepo.saveUserNotifications(
          saveUserNotification,
        );

      this.eventEmitter.emit(
        NotificationEvent.NOTIFICATION_CREATED,
        new NotificationCreatedEvent(saveNotification),
      );
    }

    if (!result?.id) {
      return `Failed to Send Notification. ${JSON.stringify(result?.errors)} `;
    }
    return `Post Reaction Notification Sent ${JSON.stringify(result)}`;
  }

  async sendPostThankYouNotification(
    payload: PostThankYouEvent,
  ): Promise<string> {
    const {
      postThankYou: {
        donor_user_id: donerUserId,
        post_id: postId,
        hlp_reward_points_donated: pointsDonated,
      },
    } = payload;
    if (!postId) {
      throw new NotFoundException('Post Id not found');
    }
    const [user, channel, userPost] = await Promise.all([
      this.notificationsRepo.getUserById(donerUserId),
      this.notificationsRepo.getChannelByPostId(postId),
      this.notificationsRepo.getUserPostByPostId(postId),
    ]);

    if (!userPost) {
      throw new NotFoundException('UserPost not Found');
    }
    const { user_id: receiverUserId, message } = userPost;
    const isEnable = await this.checkCommunityNotificationSetting(
      receiverUserId,
    );
    if (!isEnable) {
      return 'Community push notifications disabled';
    }
    const title = message.split(' ').slice(0, 3).join(' ');
    const { data, contents, headings, translations } =
      this.notificationContent.preparePostThankYouNotificationContent(
        user.user_name,
        title,
        pointsDonated,
        channel,
        postId,
      );

    const saveUserNotification: SaveUserNotificationDto = {
      user_id: receiverUserId,
      title: translations[user.language].title,
      body: translations[user.language].body,
      page: data.page,
      account_id: donerUserId,
      translations,
    };
    await this.notificationsRepo.saveUserNotifications(saveUserNotification);

    const notification = this.oneSignalService.prepareOneSignalNotification(
      data,
      contents,
      headings,
    );

    const result =
      await this.oneSignalService.sendPushNotificationToExternalUserIds(
        notification,
        [receiverUserId],
      );

    if (!result.id) {
      return `Failed to Send Notification. ${JSON.stringify(result.errors)} `;
    }
    return `Post Thank You Notification Sent. ${JSON.stringify(result)}`;
  }

  async getAgendaReminderDeepLink(
    scheduleReminder: ScheduleReminder,
    toolkit: Toolkit,
  ): Promise<string> {
    const data = await this.getReminderNotificationData(
      scheduleReminder,
      toolkit,
    );
    const page = this.notificationContent.prepareReminderDeepLink(data);
    return page;
  }

  async getAndroidChannel(
    body: GetAndroidNotificationChannel,
  ): Promise<string> {
    const channelId = this.oneSignalService.getAndroidNotificationChannel(
      body.reminderTone,
    );
    return channelId;
  }

  async getUserNotificationSetting(
    userId: string,
  ): Promise<UserNotificationSettings> {
    const userNotificationSetting =
      await this.notificationsRepo.getUserNotificationSettings(userId);
    if (!userNotificationSetting) {
      throw new NotFoundException(
        `notifications.user_notification_setting_not_found`,
      );
    }
    return userNotificationSetting;
  }

  async updateUserNotificationSettings(
    userId: string,
    input: UserNotificationSettingInput,
    userNotificationId: string,
  ): Promise<UserNotificationSettings> {
    const user = await this.notificationsRepo.getUserById(userId);
    if (!user) {
      throw new NotFoundException(`notifications.user_not_found`);
    }
    const userNotificationSetting =
      await this.notificationsRepo.updateUserNotificationSettingById(
        userNotificationId,
        input,
      );
    return userNotificationSetting;
  }

  async readNotification(
    userId: string,
    userNotificationId: string,
  ): Promise<UserNotification> {
    const userNotification = await this.notificationsRepo.readNotificationById(
      userId,
      userNotificationId,
    );
    if (!userNotification) {
      throw new NotFoundException(`notifications.user_notification_not_found`);
    }
    return userNotification;
  }

  async readAllNotifications(userId: string): Promise<UserNotification[]> {
    const userNotifications = await this.notificationsRepo.readAllNotifications(
      userId,
    );
    if (!userNotifications) {
      throw new NotFoundException(`notifications.user_notification_not_found`);
    }
    return userNotifications;
  }

  async getUserNotifications(
    userId: string,
    args: PaginationArgs,
  ): Promise<GetUserNotificationResponse> {
    const { page, limit } = args;
    const { notification, total } =
      await this.notificationsRepo.getUserNotifications(userId, page, limit);
    const hasMore = args.page * args.limit < total;
    return {
      hasMore: hasMore,
      notificationCount: total,
      notificationList: notification,
    };
  }

  async sendTestNotification(id: string): Promise<{ response: string }> {
    const notification = this.oneSignalService.prepareNotification(
      { page: '/score_tab_selected/0/bonuses_from_score' },
      'Hello',
      'Test Notification',
    );
    const result =
      await this.oneSignalService.sendPushNotificationToExternalUserIds(
        notification,
        [id],
      );

    if (result.errors) {
      throw new BadRequestException(`${JSON.stringify(result)}`);
    }
    return {
      response: `Notifications Sent. ${JSON.stringify(result)}`,
    };
  }

  async sendVideoCallNotification(
    payload: VideoCallInitiatedEvent,
  ): Promise<string> {
    const { initiatorUserId, receiverUserId, roomId, isTest, videoCallType } =
      payload;

    if (isTest) {
      return await this.sendTestVideoCallNotification(payload);
    }

    const [initiator, receiver, videoCall] = await Promise.all([
      this.notificationsRepo.getUserById(initiatorUserId),
      this.notificationsRepo.getUserById(receiverUserId),
      this.videoCallsRepo.getVideoCallByRoomId(roomId),
    ]);

    if (!initiator) {
      return `Invalid call receiver `;
    }
    if (!receiver) {
      return `Invalid call initiator `;
    }
    if (!videoCall) {
      return `Video Call Not found`;
    }

    const userName =
      initiator.first_name && initiator.last_name
        ? `${initiator.first_name} ${initiator.last_name}`
        : initiator.user_name;

    const roomSubject =
      videoCallType === ChatType.CHANNEL ? payload.roomSubject : userName;

    const { token, url, jitsiBaseUrl } =
      await this.videoCallsService.getUserTokenAndUrl(
        receiverUserId,
        roomId,
        roomSubject,
        videoCallType,
        false,
      );

    const saveVideoCallMemberInput: SaveVideoCallMemberInput = {
      video_call_id: videoCall.id,
      is_moderator: false,
      is_owner: false,
      status: VideoCallMemberStatus.CALLING,
      token: token,
      url: url,
      user_id: receiverUserId,
    };
    //save the video call member
    await this.videoCallsRepo.insertVideoCallMember(saveVideoCallMemberInput);

    const notificationPayload: VideoCallNotificactionPayload = {
      receiverUserId,
      initiatorUserId,
      roomId,
      token,
      jitsiBaseUrl,
      userName: userName,
      email: initiator.email,
      roomSubject,
      videoCallType,
      avatar:
        initiator.role === UserRoles.DOCTOR
          ? (initiator as unknown as Doctor).image_url
          : initiator.avatar_image_name,
      isVideoCall: true,
    };

    const { data, contents, headings, translations } =
      this.notificationContent.prepareVideoCallNotificationContent(
        notificationPayload,
      );

    const saveUserNotification: SaveUserNotificationDto = {
      user_id: receiverUserId,
      title: translations[receiver.language].title,
      body: translations[receiver.language].body,
      page: data.page,
      account_id: initiatorUserId,
      translations,
    };

    await this.notificationsRepo.saveUserNotifications(saveUserNotification);

    const socketPayloadData: VideoCallNotificactionPayload = {
      ...notificationPayload,
      url,
      fullName: initiator.full_name,
      role: <UserRoles>initiator.role,
      firstName: initiator.first_name,
      lastName: initiator.last_name,
    };

    const notification = this.oneSignalService.prepareOneSignalNotification(
      data,
      contents,
      headings,
      NotificationSound.RINGTONE,
    );

    const result =
      await this.oneSignalService.sendPushNotificationToExternalUserIds(
        notification,
        [receiverUserId],
      );

    //emmit event to send notification for doctor cms
    if (receiver.role === UserRoles.DOCTOR) {
      //web socket event to send socket video call notification
      this.eventEmitter.emit(
        NotificationEvent.VIDEO_CALL_NOTIFICATION_SENT,
        new VideoCallNotificationSentEvent(socketPayloadData),
      );
    }

    if (!result.id) {
      return `Failed to Send Video Call Notification. ${JSON.stringify(
        result,
      )} `;
    }

    return `Video Call Notification Sent. ${JSON.stringify(result)}`;
  }

  async prepareGroupVideoCallNotifications(
    payload: GroupVideoCallInitiatedEvent,
  ): Promise<string> {
    const { chatId, initiatorUserId, roomId, roomSubject, videoCallType } =
      payload;

    const groupMembers = await this.notificationsRepo.getGroupMembersByChatId(
      chatId,
      initiatorUserId,
    );
    //TODO: add check to avoid sending duplicate notifications
    groupMembers.forEach(async (member) => {
      const payload: VideoCallInitiatedEvent = {
        initiatorUserId,
        receiverUserId: member.id,
        roomId,
        roomSubject,
        videoCallType,
        isTest: false,
      };
      await this.notificationsQueue.addVideoCallNotificationJob(payload);
    });

    return 'Sending Group Video Call Notifications';
  }

  async sendTestVideoCallNotification(
    payload: VideoCallInitiatedEvent,
  ): Promise<string> {
    const {
      initiatorUserId,
      receiverUserId,
      roomId,
      roomSubject,
      videoCallType,
    } = payload;

    const [initiator, receiver] = await Promise.all([
      this.notificationsRepo.getUserById(initiatorUserId),
      this.notificationsRepo.getUserById(receiverUserId),
    ]);

    if (!initiator) {
      return `Invalid call receiver `;
    }
    if (!receiver) {
      return `Invalid call initiator `;
    }

    const { token, url, jitsiBaseUrl } =
      await this.videoCallsService.getUserTokenAndUrl(
        receiverUserId,
        roomId,
        roomSubject,
        videoCallType,
        false,
      );

    const notificationPayload: VideoCallNotificactionPayload = {
      receiverUserId,
      initiatorUserId,
      roomId,
      token,
      jitsiBaseUrl,
      userName: roomSubject,
      email: initiator.email,
      roomSubject,
      videoCallType,
      avatar:
        initiator.role === UserRoles.DOCTOR
          ? (initiator as unknown as Doctor).image_url
          : initiator.avatar_image_name,
      isVideoCall: true,
    };

    const { data, translations } =
      this.notificationContent.prepareVideoCallNotificationContent(
        notificationPayload,
      );

    const saveUserNotification: SaveUserNotificationDto = {
      user_id: receiverUserId,
      title: translations[receiver.language].title,
      body: translations[receiver.language].body,
      page: data.page,
      account_id: initiatorUserId,
      translations,
    };

    await this.notificationsRepo.saveUserNotifications(saveUserNotification);

    const socketPayloadData: VideoCallNotificactionPayload = {
      ...notificationPayload,
      url,
      fullName: initiator.full_name,
      role: <UserRoles>initiator.role,
      firstName: initiator.first_name,
      lastName: initiator.last_name,
    };

    const notification =
      this.oneSignalService.prepareBackgroupNotification(data);

    const result =
      await this.oneSignalService.sendPushNotificationToExternalUserIds(
        notification,
        [receiverUserId],
      );

    //web socket event to send socket video call notification
    this.eventEmitter.emit(
      NotificationEvent.VIDEO_CALL_NOTIFICATION_SENT,
      new VideoCallNotificationSentEvent(socketPayloadData),
    );

    if (!result.id) {
      return `Failed to Send Video Call Test Notification. ${JSON.stringify(
        result,
      )} `;
    }

    return `Video Call Test Notification Sent. ${JSON.stringify(result)}`;
  }

  async sendGroupInvitationNotification(
    payload: ChannelInvitation,
  ): Promise<string> {
    const { user_id, channel_id, id: invitationId } = payload;
    const [user, group] = await Promise.all([
      this.notificationsRepo.getUserById(user_id),
      this.notificationsRepo.getGroupById(channel_id),
    ]);
    if (!user) {
      return `Invalid user`;
    }
    if (!group) {
      return `Invalid group`;
    }
    const { id: userId } = user;
    const { title: groupName } = group;
    const { data, contents, headings, translations } =
      this.notificationContent.prepareGroupInvitationNotificationContent(
        groupName,
        invitationId,
        UserNotificationType.CHANNEL_INVITATION,
      );

    const saveUserNotification: SaveUserNotificationDto = {
      user_id: userId,
      title: translations[user.language].title,
      body: translations[user.language].body,
      page: data.page,
      type: UserNotificationType.CHANNEL_INVITATION,
      invitation_id: invitationId,
      translations,
    };
    await this.notificationsRepo.saveUserNotifications(saveUserNotification);

    const notification = this.oneSignalService.prepareOneSignalNotification(
      data,
      contents,
      headings,
    );
    const result =
      await this.oneSignalService.sendPushNotificationToExternalUserIds(
        notification,
        [userId],
      );
    if (!result.id) {
      return `Failed to Send Group Invitation Notification. ${JSON.stringify(
        result,
      )} `;
    }

    return `Notifications Sent ${JSON.stringify(result)}`;
  }

  async sendFriendRequestNotification(
    payload: UserFriendRequest,
  ): Promise<string> {
    const { receiver_id, sender_id, id: invitationId } = payload;
    const [sender, receiver] = await Promise.all([
      this.notificationsRepo.getUserById(sender_id),
      this.notificationsRepo.getUserById(receiver_id),
    ]);
    if (!sender) {
      return `Invalid sender`;
    }
    if (!receiver) {
      return `Invalid receiver`;
    }
    const { user_name } = sender;
    const { data, contents, headings, translations } =
      this.notificationContent.prepareFriendRequestNotificationContent(
        user_name,
        UserNotificationType.FRIEND_REQUEST,
      );

    const saveUserNotification: SaveUserNotificationDto = {
      user_id: receiver_id,
      title: translations[receiver.language].title,
      body: translations[receiver.language].body,
      page: data.page,
      type: UserNotificationType.FRIEND_REQUEST,
      invitation_id: invitationId,
      account_id: sender_id,
      translations,
    };
    await this.notificationsRepo.saveUserNotifications(saveUserNotification);

    const notification = this.oneSignalService.prepareOneSignalNotification(
      data,
      contents,
      headings,
    );
    const result =
      await this.oneSignalService.sendPushNotificationToExternalUserIds(
        notification,
        [receiver_id],
      );
    if (!result.id) {
      return `Failed to Send Freiend Request Notification. ${JSON.stringify(
        result,
      )} `;
    }
    return `Friend Request Notification Sent. ${JSON.stringify(result)}`;
  }

  async getChannel(channelId: string): Promise<Channel> {
    const channel = await this.notificationsRepo.getChannelById(channelId);
    if (!channel) {
      throw new NotFoundException(`Channel Not found ${channelId}`);
    }
    return channel;
  }

  async updateNotificationCount(userId: string, count: number): Promise<void> {
    const key = this.redisService.getNotificationCountKey();
    await this.redisService.hset(key, [userId, count]);
  }

  async getNotificationCount(userId: string): Promise<number> {
    const key = this.redisService.getNotificationCountKey();
    const data = await this.redisService.hget(key, userId);
    if (!data) {
      return 0;
    } else {
      return Number(data);
    }
  }

  async getDoctorNotifications(
    userId: string,
    args: DoctorNotificationArgs,
  ): Promise<GetDoctorNotificationResponse> {
    const { page, limit } = args;
    const { notification, total } =
      await this.notificationsRepo.getUserNotifications(userId, page, limit);
    const totalPages = Math.ceil(total / limit);
    await this.updateNotificationCount(userId, total);
    return {
      notificationCount: total,
      notificationList: notification,
      totalPages,
      page,
      limit,
    };
  }

  async sendDoctorSocketNotification(
    notification: UserNotification,
    server: SocketIOServer,
  ): Promise<void> {
    const { user_id: doctorId } = notification;
    const user = await this.notificationsRepo.getUserById(doctorId);
    if (user.role !== UserRoles.DOCTOR) {
      return;
    }
    //get the current count and update the count
    const count = await this.getNotificationCount(doctorId);
    const updatedCount = count + 1;
    await this.updateNotificationCount(doctorId, updatedCount);

    server.emit(WEBSOCKET_CLIENT_EVENT.DOCTORS_NOTIFICATIONS_ALERT(doctorId), {
      notification,
      notificationCount: updatedCount,
    });
  }

  async sendCoachAddedGroupNotification(payload: UserChannel): Promise<string> {
    const { user_id: receiver_id, channel_id } = payload;
    const [user, group] = await Promise.all([
      this.notificationsRepo.getUserById(receiver_id),
      this.notificationsRepo.getChannelById(channel_id),
    ]);

    if (!user) {
      return `Invalid user`;
    }

    if (!group) {
      return `Invalid group`;
    }

    const { title: groupName, id: channelId } = group;
    const { first_name, last_name } = user;
    const coachName = `${first_name} ${last_name}`;
    const { data, translations } =
      this.notificationContent.prepareCoachGroupNotificationContent(
        groupName,
        coachName,
      );

    const metadata: NotificationMetadata = {
      channel_id: channelId,
    };
    const saveUserNotification: SaveUserNotificationDto = {
      user_id: receiver_id,
      title: translations[user.language].title,
      body: translations[user.language].body,
      page: data.page,
      type: UserNotificationType.COACH_ADDED_TO_PRIVATE_GROUP,
      metadata,
      translations,
    };

    const notification = await this.notificationsRepo.saveUserNotifications(
      saveUserNotification,
    );
    this.eventEmitter.emit(
      NotificationEvent.NOTIFICATION_CREATED,
      new NotificationCreatedEvent(notification),
    );
    return `Coach Added Group Notification Sent.`;
  }

  async sendCoachAddedNotification(payload: DoctorTreatment): Promise<string> {
    const {
      doctor_id: receiver_id,
      treatment_id,
      updated_by: sender_id,
    } = payload;

    const promises = [
      this.notificationsRepo.getUserById(receiver_id),
      this.notificationsRepo.getTreatmentPatient(treatment_id),
    ];

    if (sender_id) {
      promises.push(this.notificationsRepo.getUserById(sender_id));
    }

    const [receiver, treatmentPatient, sender] = await Promise.all(promises);

    if (!sender) {
      return `Invalid sender`;
    }

    if (!receiver) {
      return `Invalid receiver`;
    }

    const doctorTreatment = await this.notificationsRepo.getDoctorTreatment(
      receiver_id,
      treatment_id,
    );

    if (!doctorTreatment) {
      return 'Doctor Treatment Not Available';
    }

    const { id: doctorTreatmentId } = doctorTreatment;
    const {
      first_name,
      last_name,
      id: patientId,
      user_name,
    } = treatmentPatient;

    const patientName =
      first_name && last_name ? `${first_name} ${last_name}` : user_name;

    const {
      first_name: coachFirstName,
      last_name: coachLastName,
      user_name: coachUserName,
    } = sender;

    const coachName =
      coachFirstName && coachLastName
        ? `${coachFirstName} ${coachLastName}`
        : coachUserName;

    const { data, translations } =
      this.notificationContent.prepareCoachAddedNotificationContent(
        patientName,
        coachName,
      );

    const metadata: NotificationMetadata = {
      user_id: patientId,
      name: patientName,
      treatment_id,
      doctor_treatment_id: doctorTreatmentId,
    };

    const saveUserNotification: SaveUserNotificationDto = {
      user_id: receiver_id,
      title: translations[receiver.language].title,
      body: translations[receiver.language].body,
      page: data.page,
      type: UserNotificationType.COACH_ADDED_TO_TREATMENT_TEAM,
      metadata,
      translations,
    };
    const notification = await this.notificationsRepo.saveUserNotifications(
      saveUserNotification,
    );

    this.eventEmitter.emit(
      NotificationEvent.NOTIFICATION_CREATED,
      new NotificationCreatedEvent(notification),
    );
    return `Coach Added To Treatment Team as Notification Sent.`;
  }

  async sendUserRegisteredNotification(payload: Users): Promise<string> {
    const {
      first_name,
      last_name,
      invitation_id,
      email,
      language,
      id: userId,
      user_name,
    } = payload;

    if (!invitation_id) {
      return `invitation_id not Available`;
    }

    const [treatment, invitation] = await Promise.all([
      this.notificationsRepo.getTreatmentByUserId(userId),
      this.notificationsRepo.getPatientInvitation(
        invitation_id,
        email,
        PaitentInvitationStatus.ACCEPTED,
      ),
    ]);

    const { doctor_id } = invitation;
    const patientName =
      first_name && last_name ? `${first_name} ${last_name}` : user_name;

    const doctorTreatment = await this.notificationsRepo.getDoctorTreatment(
      doctor_id,
      treatment.id,
    );

    if (!doctorTreatment) {
      return 'Doctor Treatment Not Available';
    }

    const { id: doctorTreatmentId } = doctorTreatment;
    const { data, translations } =
      this.notificationContent.prepareUserRegisteredNotificationContent(
        patientName,
      );

    const metadata: NotificationMetadata = {
      user_id: userId,
      name: patientName,
      treatment_id: treatment.id,
      doctor_treatment_id: doctorTreatmentId,
    };

    const saveUserNotification: SaveUserNotificationDto = {
      user_id: doctor_id,
      title: translations[language].title,
      body: translations[language].body,
      page: data.page,
      type: UserNotificationType.INVITED_USER_REGISTERED,
      metadata,
      translations,
    };

    const notification = await this.notificationsRepo.saveUserNotifications(
      saveUserNotification,
    );
    this.eventEmitter.emit(
      NotificationEvent.NOTIFICATION_CREATED,
      new NotificationCreatedEvent(notification),
    );
    return `Patient Registered Notification Sent.`;
  }

  async sendAppointmentScheduleAddedNotification(
    payload: ScheduleEntity,
  ): Promise<string> {
    const {
      created_by: doctor_id,
      user: patientId,
      start_date,
      id: scheduleId,
      is_completed,
    } = payload;
    if (!doctor_id) {
      return 'doctor_id not found';
    }
    const doctor = await this.notificationsRepo.getUserById(doctor_id);

    const { first_name, last_name } = doctor;
    const doctorName = `${first_name} ${last_name}`;
    const appointmentDate = getISODate(new Date(start_date));

    const { data, contents, headings, translations } =
      this.notificationContent.prepareAppointmentScheduleAddedNotificationContent(
        doctorName,
        appointmentDate,
        scheduleId,
        is_completed,
      );

    const saveUserNotification: SaveUserNotificationDto = {
      user_id: patientId,
      title: translations[doctor.language].title,
      body: translations[doctor.language].body,
      page: data.page,
      type: UserNotificationType.TREATMENT_TIMELINE,
      account_id: doctor.id,
      translations,
    };
    await this.notificationsRepo.saveUserNotifications(saveUserNotification);

    const notification = this.oneSignalService.prepareOneSignalNotification(
      data,
      contents,
      headings,
    );
    const result =
      await this.oneSignalService.sendPushNotificationToExternalUserIds(
        notification,
        [patientId],
      );
    return `Appointment Scheduled Notification Sent. ${JSON.stringify(result)}`;
  }

  async getUserById(userId: string): Promise<Users> {
    const user = await this.notificationsRepo.getUserById(userId);
    if (!user) {
      throw new NotFoundException(`User Not found`);
    }
    return user;
  }

  async sendTimelineNoteAddedNotification(
    payload: TreatmentTimelineNoteAddedEvent,
  ): Promise<string> {
    const { userId: patientId, timelineAttachment } = payload;
    const { created_by } = timelineAttachment;
    const user = await this.notificationsRepo.getUserById(created_by);
    if (!user) {
      throw new NotFoundException(`User Not found`);
    }
    const { first_name, last_name } = user;
    const coachName = `${first_name} ${last_name}`;

    const { data, contents, headings, translations } =
      this.notificationContent.prepareTimelineNoteAddedNotificationContent(
        coachName,
      );

    const saveUserNotification: SaveUserNotificationDto = {
      user_id: patientId,
      title: translations[user.language].title,
      body: translations[user.language].body,
      page: data.page,
      type: UserNotificationType.TREATMENT_TIMELINE,
      account_id: created_by,
      translations,
    };

    await this.notificationsRepo.saveUserNotifications(saveUserNotification);
    const notification = this.oneSignalService.prepareOneSignalNotification(
      data,
      contents,
      headings,
    );
    const result =
      await this.oneSignalService.sendPushNotificationToExternalUserIds(
        notification,
        [patientId],
      );
    return `Treatment Timeline Note Added Notification Sent. ${JSON.stringify(
      result,
    )}`;
  }

  async sendTreatmentAddedNotification(
    payload: TreatmentAddedEvent,
  ): Promise<string> {
    const { userId, doctorTreatment } = payload;
    const { doctor_id, treatment_id } = doctorTreatment;
    const [doctor, treatmentOption] = await Promise.all([
      await this.notificationsRepo.getUserById(doctor_id),
      await this.notificationsRepo.getTreatmentOptionByTreatmentId(
        treatment_id,
      ),
    ]);

    const { first_name, last_name } = doctor;
    const coachName = `${first_name} ${last_name}`;
    const { title: treatmentType } = treatmentOption;

    const { data, contents, headings, translations } =
      this.notificationContent.prepareTreatmentAddedNotificationContent(
        treatmentType,
        coachName,
      );
    const saveUserNotification: SaveUserNotificationDto = {
      user_id: userId,
      title: translations[doctor.language].title,
      body: translations[doctor.language].body,
      page: data.page,
      translations,
    };

    await this.notificationsRepo.saveUserNotifications(saveUserNotification);
    const notification = this.oneSignalService.prepareOneSignalNotification(
      data,
      contents,
      headings,
    );
    const result =
      await this.oneSignalService.sendPushNotificationToExternalUserIds(
        notification,
        [userId],
      );
    if (!result.id) {
      return `Failed to Send Treatment Added Notification. ${JSON.stringify(
        result,
      )} `;
    }
    return `Treatment Added Notification Sent. ${JSON.stringify(result)}`;
  }

  async sendTreatmentTimelineFileAddedNotification(
    payload: TreatmentTimelineFileAddedEvent,
  ): Promise<string> {
    const { userId: patientId, timelineAttachment } = payload;
    const { created_by } = timelineAttachment;
    const user = await this.notificationsRepo.getUserById(created_by);
    if (!user) {
      throw new NotFoundException(`User Not found`);
    }
    const { first_name, last_name } = user;
    const coachName = `${first_name} ${last_name}`;
    const { data, contents, headings, translations } =
      this.notificationContent.prepareTimelineFileAddedNotificationContent(
        coachName,
      );

    const saveUserNotification: SaveUserNotificationDto = {
      user_id: patientId,
      title: translations[user.language].title,
      body: translations[user.language].body,
      page: data.page,
      type: UserNotificationType.TREATMENT_TIMELINE,
      account_id: created_by,
      translations,
    };

    await this.notificationsRepo.saveUserNotifications(saveUserNotification);
    const notification = this.oneSignalService.prepareOneSignalNotification(
      data,
      contents,
      headings,
    );
    const result =
      await this.oneSignalService.sendPushNotificationToExternalUserIds(
        notification,
        [patientId],
      );
    return `Treatment Timeline File Added Notification Sent. ${JSON.stringify(
      result,
    )}`;
  }

  async sendActivityScheduleAddedNotification(
    payload: ScheduleEntity,
  ): Promise<string> {
    const {
      created_by: doctor_id,
      user: patientId,
      user_toolkit_title,
    } = payload;
    if (!doctor_id) {
      return 'doctor_id not found';
    }
    if (!user_toolkit_title) {
      return 'user_toolkit_title not found';
    }
    const doctor = await this.notificationsRepo.getUserById(doctor_id);

    const { first_name, last_name } = doctor;
    const doctorName = `${first_name} ${last_name}`;

    const { data, contents, headings, translations } =
      this.notificationContent.prepareActivityScheduleAddedNotificationContent(
        doctorName,
        user_toolkit_title,
      );

    const saveUserNotification: SaveUserNotificationDto = {
      user_id: patientId,
      title: translations[doctor.language].title,
      body: translations[doctor.language].body,
      page: data.page,
      account_id: doctor.id,
      type: UserNotificationType.TREATMENT_TIMELINE,
      translations,
    };
    await this.notificationsRepo.saveUserNotifications(saveUserNotification);

    const notification = this.oneSignalService.prepareOneSignalNotification(
      data,
      contents,
      headings,
    );

    const result =
      await this.oneSignalService.sendPushNotificationToExternalUserIds(
        notification,
        [patientId],
      );
    return `Appointment Scheduled Notification Sent. ${JSON.stringify(result)}`;
  }

  async sendUserAppointmentReminderNotification(
    payload: SendAppointmentReminderEvent,
  ): Promise<string> {
    const { scheduleReminder } = payload;
    const { schedule_id, user_id } = scheduleReminder;
    const schedule = await this.notificationsRepo.getSchedule(schedule_id);
    const user = await this.notificationsRepo.getUserById(user_id);
    if (!user) {
      throw new NotFoundException(`User Not found`);
    }
    const { language } = user;
    const {
      user_appointment_title,
      id: scheduleId,
      start_date,
      is_completed,
    } = schedule;
    if (!user_appointment_title) {
      return 'user_appointment_title not found';
    }
    const appointmentDate = getISODate(new Date(start_date));
    const translatedAppointmentTitle = this.translationService.translate(
      `appointment.type.${user_appointment_title}`,
      {},
      language,
    );
    const { data, contents, headings, translations } =
      this.notificationContent.prepareAppointmentReminderNotificationContent(
        translatedAppointmentTitle,
        appointmentDate,
        scheduleId,
        is_completed,
      );

    const saveUserNotification: SaveUserNotificationDto = {
      user_id: user_id,
      title: translations[user.language].title,
      body: translations[user.language].body,
      page: data.page,
      translations,
    };
    await this.notificationsRepo.saveUserNotifications(saveUserNotification);
    const notification = this.oneSignalService.prepareOneSignalNotification(
      data,
      contents,
      headings,
    );
    const result =
      await this.oneSignalService.sendPushNotificationToExternalUserIds(
        notification,
        [user_id],
      );
    return `User Appointment Reminder Notification Sent. ${JSON.stringify(
      result,
    )}`;
  }

  async sendGroupMemberAddedNotification(
    payload: UserChannel,
  ): Promise<string> {
    const { user_id, channel_id } = payload;
    const [user, group] = await Promise.all([
      this.notificationsRepo.getUserById(user_id),
      this.notificationsRepo.getGroupById(channel_id),
    ]);
    if (!user) {
      return `Invalid user`;
    }
    if (!group) {
      return `Invalid group`;
    }
    const { id: userId } = user;
    const { data, contents, headings, translations } =
      this.notificationContent.prepareGroupMemberAddedNotificationContent(
        group,
        channel_id,
      );

    const saveUserNotification: SaveUserNotificationDto = {
      user_id: userId,
      title: translations[user.language].title,
      body: translations[user.language].body,
      page: data.page,
      translations,
    };
    await this.notificationsRepo.saveUserNotifications(saveUserNotification);

    const notification = this.oneSignalService.prepareOneSignalNotification(
      data,
      contents,
      headings,
    );
    const result =
      await this.oneSignalService.sendPushNotificationToExternalUserIds(
        notification,
        [userId],
      );
    if (!result.id) {
      return `Failed to Send Group Invitation Notification. ${JSON.stringify(
        result,
      )} `;
    }

    return `Notifications Sent ${JSON.stringify(result)}`;
  }

  async sendTreatmentClosedNotification(
    payload: TreatmentClosedEvent,
  ): Promise<string> {
    const { treatment } = payload;

    const { id: treatmentId, user_id } = treatment;
    const user = await this.getUserById(user_id);
    if (!user) {
      return 'User not found';
    }
    const treatmentWithTreatmentUsers =
      await this.notificationsRepo.getTreatmentWithTreatmentUsers(treatmentId);

    if (!treatmentWithTreatmentUsers) {
      return 'Treatment Team not found';
    }

    treatmentWithTreatmentUsers.forEach(async (treatmentWithTreatmentUser) => {
      const {
        id: userId,
        role,
        user_name,
        treatment_name,
        first_name,
        last_name,
      } = treatmentWithTreatmentUser;

      if (role === UserRoles.USER) {
        const { data, contents, headings, translations } =
          this.notificationContent.prepareTreatmentClosedNotificationContent(
            user_name,
            treatment_name,
          );

        const saveUserNotification: SaveUserNotificationDto = {
          user_id: userId,
          title: translations[user.language].title,
          body: translations[user.language].body,
          page: data.page,
          translations,
        };

        await this.notificationsRepo.saveUserNotifications(
          saveUserNotification,
        );

        const notification = this.oneSignalService.prepareOneSignalNotification(
          data,
          contents,
          headings,
        );

        await this.oneSignalService.sendPushNotificationToExternalUserIds(
          notification,
          [userId],
        );
      } else if (role === UserRoles.DOCTOR) {
        const name = `${first_name} ${last_name}`;

        const { data, translations } =
          this.notificationContent.prepareTreatmentClosedNotificationContent(
            name,
            treatment_name,
          );

        const saveUserNotification: SaveUserNotificationDto = {
          user_id: userId,
          title: translations[user.language].title,
          body: translations[user.language].body,
          page: data.page,
          translations,
        };

        const notification = await this.notificationsRepo.saveUserNotifications(
          saveUserNotification,
        );

        this.eventEmitter.emit(
          NotificationEvent.NOTIFICATION_CREATED,
          new NotificationCreatedEvent(notification),
        );
      }
    });

    return `Treatment Closed Notification Sent.`;
  }

  async sendToolkitPerformedNotification(
    payload: ScheduleSessionDto,
  ): Promise<string> {
    const { session_date, schedule_id: scheduleId } = payload;

    const scheduleWithUser = await this.notificationsRepo.getScheduleWithUser(
      scheduleId,
    );

    if (!scheduleWithUser) {
      return `Schedule Not Found`;
    }

    //users is the patient and doctors is the doctor who added the schedule
    const { users, doctors } = scheduleWithUser;

    if (!users) {
      return 'users not found in schedule';
    }

    if (!doctors) {
      return 'doctorId not found in schedule';
    }

    const agenda = await this.scheduleService.getAgendaByScheduleId(
      session_date,
      scheduleId,
    );

    if (!agenda) {
      return 'agenda not found';
    }

    const { id: userId, first_name, last_name, user_name } = users;

    const patientName =
      first_name && last_name ? `${first_name} ${last_name}` : user_name;

    let doctorTreatment;

    if (agenda.treatment_id) {
      doctorTreatment = await this.notificationsRepo.getDoctorTreatment(
        doctors.id,
        agenda.treatment_id,
      );
    }

    if (!doctorTreatment) {
      return 'Doctor Treatment Not Available';
    }

    const { id: doctorTreatmentId } = doctorTreatment;
    const translations =
      this.notificationContent.prepareToolkitPerformedNotificationContent(
        patientName,
        agenda,
      );

    const metadata: NotificationMetadata = {
      user_id: userId,
      name: patientName,
      treatment_id: agenda.treatment_id,
      doctor_treatment_id: doctorTreatmentId,
      agenda: agenda,
    };

    const saveUserNotification: SaveUserNotificationDto = {
      user_id: doctors.id,
      title: translations[doctors.language].title,
      body: translations[doctors.language].body,
      page: '/',
      type: UserNotificationType.TOOLKIT_PERFORMED_BY_USER,
      metadata,
      translations,
    };

    const notification = await this.notificationsRepo.saveUserNotifications(
      saveUserNotification,
    );

    this.eventEmitter.emit(
      NotificationEvent.NOTIFICATION_CREATED,
      new NotificationCreatedEvent(notification),
    );

    return `Toolkit/Form Performed Notification Sent. `;
  }

  async sendTreatmentClosedOwnerEmail(
    payload: TreatmentClosedEvent,
  ): Promise<string> {
    const { treatment } = payload;
    const { id: treatmentId, user_id } = treatment;
    const user = await this.notificationsRepo.getUserById(user_id);
    const treatmentOwner =
      await this.notificationsRepo.getTreatmentOwnerByTreatmentId(treatmentId);

    if (!treatmentOwner) {
      return 'Treatment Owner not found';
    }
    const { id: doctorId } = treatmentOwner;

    const { data, translations } =
      this.notificationContent.prepareAfterCareNotificationToTreatmentOwner();

    const saveUserNotification: SaveUserNotificationDto = {
      user_id: doctorId,
      title: translations[user.language].title,
      body: translations[user.language].body,
      page: data.page,
      translations,
    };

    const notification = await this.notificationsRepo.saveUserNotifications(
      saveUserNotification,
    );
    this.eventEmitter.emit(
      NotificationEvent.NOTIFICATION_CREATED,
      new NotificationCreatedEvent(notification),
    );
    return 'Start After Care Treatment Notification Sent To Doctor';
  }

  async sendToolkitTimelineMessageAddedNotification(
    payload: ToolkitTimelineMessageAddedEvent,
  ): Promise<string> {
    const { user_id } = payload.data;

    const user = await this.notificationsRepo.getUserById(user_id);
    if (!user) {
      return 'User not found';
    }

    const { data, contents, headings, translations } =
      this.notificationContent.prepareToolkitTimelineMessageAddedNotificationContent();

    const saveUserNotification: SaveUserNotificationDto = {
      user_id: user_id,
      title: translations[user.language].title,
      body: translations[user.language].body,
      page: data.page,
      translations,
    };

    await this.notificationsRepo.saveUserNotifications(saveUserNotification);

    const notification = this.oneSignalService.prepareOneSignalNotification(
      data,
      contents,
      headings,
    );

    const result =
      await this.oneSignalService.sendPushNotificationToExternalUserIds(
        notification,
        [user_id],
      );

    if (!result.id) {
      return `Failed to Send Notification. ${JSON.stringify(result.errors)} `;
    }
    return 'Toolkit Timeline Message Added Notification Sent Successfully';
  }

  async sendUserToolkitReminderNotification(
    payload: SendUserToolkitReminderEvent,
  ): Promise<string> {
    const { scheduleReminder, userTookit } = payload;
    const { user_id, reminder_time } = scheduleReminder;

    const [userNotificationSettings, user] = await Promise.all([
      this.notificationsRepo.getUserNotificationSettings(user_id),
      this.notificationsRepo.getUserById(user_id),
    ]);

    const { allow_reminder_push_notification, reminder_sound: reminderSound } =
      userNotificationSettings;

    if (!allow_reminder_push_notification) {
      return 'Reminder Push Notifications are Disabled';
    }

    if (!user) {
      return 'User not found';
    }

    const { title } = userTookit;

    if (!title) {
      return 'User toolkit not found';
    }

    const { data, contents, headings, translations } =
      this.notificationContent.prepareUserToolkitReminderNotificationContent(
        title,
        reminder_time,
      );

    const saveUserNotification: SaveUserNotificationDto = {
      user_id: user_id,
      title: translations[user.language].title,
      body: translations[user.language].body,
      page: data.page,
      translations,
    };

    await this.notificationsRepo.saveUserNotifications(saveUserNotification);

    const notification = this.oneSignalService.prepareOneSignalNotification(
      data,
      contents,
      headings,
      reminderSound,
    );

    const result =
      await this.oneSignalService.sendPushNotificationToExternalUserIds(
        notification,
        [user_id],
      );

    return `User Toolkit Reminder Notification Sent. ${JSON.stringify(result)}`;
  }
}
