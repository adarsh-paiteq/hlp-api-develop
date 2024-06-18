import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as OneSignal from '@onesignal/node-onesignal';
import { createHmac } from 'crypto';
import { EnvVariable } from '@core/configs/config';
import { v4 as uuidv4 } from 'uuid';

export enum OneSignalSegments {
  SUBSCRIBED_USERS = 'Subscribed Users',
  INACTIVE_USERS = 'Inactive Users',
}

export enum ChannelForExternalIds {
  PUSH = 'push',
}

export interface NotificationChannels {
  development: NotificationChannel[];
  staging: NotificationChannel[];
  production: NotificationChannel[];
}

export interface NotificationChannel {
  id: string;
  reminderTone: string;
}

@Injectable()
export class OneSignalService {
  private client: OneSignal.DefaultApi;
  private appId: string;
  private readonly logger = new Logger(OneSignalService.name);
  constructor(private readonly configService: ConfigService) {
    this.configure();
  }

  private getConfiguration(): OneSignal.Configuration {
    const appKey = this.configService.get(EnvVariable.ONESIGNAL_APP_KEY);
    const app_key_provider = {
      getToken(): string {
        return appKey;
      },
    };
    const configuration = OneSignal.createConfiguration({
      authMethods: {
        app_key: {
          tokenProvider: app_key_provider,
        },
      },
    });
    return configuration;
  }

  private configure(): void {
    const configuration = this.getConfiguration();
    const appId = this.configService.get(EnvVariable.ONESIGNAL_APP_ID);
    this.client = new OneSignal.DefaultApi(configuration);
    this.appId = appId;
  }

  /**
   * @deprecated Use prepareOneSignalNotification() function to send translated content and heading.
   */
  prepareNotification(
    data: object,
    content: string,
    heading: string,
    reminderSound?: string,
  ): OneSignal.Notification {
    const notification = new OneSignal.Notification();
    notification.app_id = this.appId;
    notification.data = { ...data, notificationId: uuidv4() };
    notification.priority = 10;

    notification.contents = {
      en: content,
    };
    notification.headings = {
      en: heading,
    };

    if (reminderSound) {
      notification.ios_sound = reminderSound;
      const androidChannelId =
        this.getAndroidNotificationChannel(reminderSound);
      if (!androidChannelId) {
        return notification;
      }
      const [reminderSoundAndroid] = reminderSound.split('.');
      notification.android_channel_id = androidChannelId;
      notification.android_sound = reminderSoundAndroid;
    }
    return notification;
  }

  prepareOneSignalNotification(
    data: object,
    contents: OneSignal.StringMap,
    headings: OneSignal.StringMap,
    reminderSound?: string,
  ): OneSignal.Notification {
    const notification = new OneSignal.Notification();
    notification.app_id = this.appId;
    notification.data = { ...data, notificationId: uuidv4() };
    notification.priority = 10;
    notification.content_available = true;
    notification.contents = contents;
    // required for Huawei
    notification.headings = headings;

    if (reminderSound) {
      notification.ios_sound = reminderSound;
      const androidChannelId =
        this.getAndroidNotificationChannel(reminderSound);
      if (!androidChannelId) {
        return notification;
      }
      const [reminderSoundAndroid] = reminderSound.split('.');
      notification.android_channel_id = androidChannelId;
      notification.android_sound = reminderSoundAndroid;
    }
    return notification;
  }

  async sendNotification(
    notification: OneSignal.Notification,
  ): Promise<OneSignal.CreateNotificationSuccessResponse> {
    return await this.client.createNotification(notification);
  }

  async generateAuthHash(data: string): Promise<string> {
    const appKey = this.configService.get(EnvVariable.ONESIGNAL_APP_KEY);
    const hmac = createHmac('sha256', appKey);
    hmac.update(data);
    const hex = hmac.digest('hex');
    //The Hmac object can not be used again after hmac.digest() has been called.
    return hex;
  }

  async sendPushNotificationToExternalUserIds(
    notification: OneSignal.Notification,
    externalUserIds: string[],
  ): Promise<OneSignal.CreateNotificationSuccessResponse> {
    return this.sendNotification({
      ...notification,
      include_external_user_ids: externalUserIds,
      channel_for_external_user_ids: ChannelForExternalIds.PUSH,
    });
  }

  async sendPushNotificationToSegments(
    notification: OneSignal.Notification,
    segments: OneSignalSegments[],
  ): Promise<OneSignal.CreateNotificationSuccessResponse> {
    return this.sendNotification({
      ...notification,
      included_segments: segments,
    });
  }

  /**
   * @reference https://documentation.onesignal.com/docs/data-notifications#backgrounddata-notifications-with-the-rest-api
   */
  prepareBackgroupNotification(data: object): OneSignal.Notification {
    const notification = new OneSignal.Notification();
    notification.app_id = this.appId;
    notification.data = { ...data, notificationId: uuidv4() };
    notification.content_available = true;
    notification.apns_push_type_override = 'voip';
    return notification;
  }

  getAndroidNotificationChannel(reminderTone: string): string {
    const channelsEncodedString = this.configService.getOrThrow(
      EnvVariable.ONESIGNAL_ANDROID__NOTIFICATION_CHANNELS,
    );
    const channelsDecodedString = Buffer.from(
      channelsEncodedString,
      'base64',
    ).toString();
    const channels: NotificationChannels = JSON.parse(channelsDecodedString);
    const nodeenv = this.configService.getOrThrow<string>(EnvVariable.NODE_ENV);
    const envAndroidChannels = channels[
      nodeenv as keyof NotificationChannels
    ] as NotificationChannel[];
    if (!envAndroidChannels) {
      this.logger.warn(
        `Android notification channels not configured for this ${nodeenv}`,
      );
      return '';
    }
    const channel = envAndroidChannels.find(
      (channel) => channel.reminderTone === reminderTone,
    );
    if (!channel) {
      this.logger.warn(`No channel found for ${reminderTone}`);
      return '';
    }
    return channel.id;
  }
}
