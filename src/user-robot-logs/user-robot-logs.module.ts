import { Module } from '@nestjs/common';
import { UserRobotLogsService } from './user-robot-logs.service';
import { UserRobotLogsController } from './user-robot-logs.controller';
import {
  registerUserRobotLogQueue,
  UserRobotLogQueue,
} from './user-robot-logs.queue';
import { UserRobotLogsProcessor } from './user-robot-logs.processor';
import { UserRobotLogsRepo } from './user-robot-logs.repo';

@Module({
  controllers: [UserRobotLogsController],
  providers: [
    UserRobotLogsService,
    UserRobotLogsProcessor,
    UserRobotLogQueue,
    UserRobotLogsRepo,
  ],
  imports: [registerUserRobotLogQueue],
  exports: [registerUserRobotLogQueue, UserRobotLogQueue],
})
export class UserRobotLogsModule {}
