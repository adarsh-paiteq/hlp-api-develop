import { Module } from '@nestjs/common';
import { UserSessionLogProcessor } from './user-session-log.processor';
import {
  registerUserSessionLogQueue,
  UserSessionLogQueue,
} from './user-session-log.queue';
import { UserSessionLogsRepo } from './user-session-logs.repo';
import { UserSessionLogsService } from './user-session-logs.service';

@Module({
  providers: [
    UserSessionLogsService,
    UserSessionLogsRepo,
    UserSessionLogQueue,
    UserSessionLogProcessor,
  ],
  imports: [registerUserSessionLogQueue],
  exports: [registerUserSessionLogQueue, UserSessionLogQueue],
})
export class UserSessionLogsModule {}
