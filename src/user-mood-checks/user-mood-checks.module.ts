import { Module } from '@nestjs/common';
import { UserMoodChecksService } from './user-mood-checks.service';
import { UserMoodChecksResolver } from './user-mood-checks.resolver';
import { UserMoodChecksRepo } from './user-mood-check.repo';
import { AuthModule } from '../shared/auth/auth.module';
import {
  registerUserMoodChecksQueue,
  UserMoodChecksQueue,
} from './user-mood-checks.queue';
import { UserMoodChecksProcessor } from './user-mood-checks.processor';

@Module({
  providers: [
    UserMoodChecksResolver,
    UserMoodChecksService,
    UserMoodChecksRepo,
    UserMoodChecksProcessor,
    UserMoodChecksQueue,
  ],
  imports: [AuthModule, registerUserMoodChecksQueue],
  exports: [registerUserMoodChecksQueue],
})
export class UserMoodChecksModule {}
