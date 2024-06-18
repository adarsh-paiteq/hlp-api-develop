import { Module } from '@nestjs/common';
import { RobotsService } from './robots.service';
import { RobotsResolver } from './robots.resolver';
import { AuthModule } from '@shared/auth/auth.module';
import { RobotsRepo } from './robots.repo';
import { RobotsHelper } from './robot.helper';
import { UserRobotLogsModule } from '../user-robot-logs/user-robot-logs.module';
import { UserSessionLogsModule } from '../user-session-logs/user-session-logs.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  providers: [RobotsResolver, RobotsService, RobotsRepo, RobotsHelper],
  imports: [
    AuthModule,
    UserRobotLogsModule,
    UserSessionLogsModule,
    NotificationsModule,
  ],
  exports: [RobotsService],
})
export class RobotsModule {}
