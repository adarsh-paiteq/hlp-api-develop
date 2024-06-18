import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as OneSignal from '@onesignal/node-onesignal';
import { EnvVariable } from '@core/configs/config';
import { ChannelForExternalIds } from './one-signal';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class VoIPOneSignalService {
  private client: OneSignal.DefaultApi;
  private appId: string;
  private readonly logger = new Logger(VoIPOneSignalService.name);
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

  async sendNotification(
    notification: OneSignal.Notification,
  ): Promise<OneSignal.CreateNotificationSuccessResponse> {
    return await this.client.createNotification(notification);
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
}
