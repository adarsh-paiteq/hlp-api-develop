import { VideoCallNotificactionPayload } from '@video-calls/dto/video-calls.dto';
import { EngagementNotification } from './notifications.model';
import { UserNotification } from './entities/user-notifications.entity';

export enum NotificationEvent {
  SEND_ENGAGEMENT_NOTIFICATION = '[NOTIFICATIONS] SEND ENGAGEMENT NOTIFICATION',
  VIDEO_CALL_NOTIFICATION_SENT = '[NOTIFICATIONS] VIDEO CALL NOTIFICATION SENT',
  NOTIFICATION_CREATED = '[NOTIFICATIONS] NOTIFICATION_CREATED',
}

export class SendEngagementNotificationEvent {
  constructor(public engagementNotification: EngagementNotification) {}
}

export class VideoCallNotificationSentEvent {
  constructor(public notificationPayload: VideoCallNotificactionPayload) {}
}

export class NotificationCreatedEvent {
  constructor(public userNotification: UserNotification) {}
}
