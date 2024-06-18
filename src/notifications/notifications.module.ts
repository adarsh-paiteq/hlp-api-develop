import { forwardRef, Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import {
  NotificationsQueue,
  registerNotificationsQueue,
} from './notifications.queue';
import { NotificationsProcessor } from './notifications.processor';
import { AuthModule } from '@shared/auth/auth.module';
import { NotificationsRepo } from './notifications.repo';
import { NotificationsEventListener } from './notification.listener';
import { NotificationsContent } from './notifications-content';
import { OneSignalService } from '@shared/services/one-signal/one-signal';
import { NotificationsResolver } from './notifications.resolver';
import { UsersModule } from '@users/users.module';
import { VideoCallsModule } from '@video-calls/video-calls.module';
import { VideoCallsService } from '@video-calls/video-calls.service';
import { VideoCallsRepo } from '@video-calls/video-calls.repo';
import { VoIPOneSignalService } from '@shared/services/one-signal/voip-one-signal';
import { ChatsModule } from '@chats/chats.module';
import { SchedulesModule } from '@schedules/schedules.module';

@Module({
  imports: [
    registerNotificationsQueue,
    AuthModule,
    forwardRef(() => UsersModule),
    VideoCallsModule,
    forwardRef(() => SchedulesModule),
    ChatsModule,
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsProcessor,
    NotificationsQueue,
    NotificationsRepo,
    NotificationsEventListener,
    NotificationsContent,
    OneSignalService,
    NotificationsResolver,
    VideoCallsService,
    VideoCallsRepo,
    VoIPOneSignalService,
  ],
  exports: [
    registerNotificationsQueue,
    NotificationsService,
    NotificationsRepo,
    NotificationsResolver,
  ],
})
export class NotificationsModule {}
