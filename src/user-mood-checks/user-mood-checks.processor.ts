import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import Bull from 'bull';
import { defaultWorkersConcurrency } from '../core/configs/bull.config';
import { ProcessorLogger } from '../core/helpers/processor-logging.helper';
import {
  UserMoodChecksJob,
  USER_MOOD_CHECKS_QUEUE,
} from './user-mood-checks.queue';
import { UserMoodChecksService } from './user-mood-checks.service';

@Processor(USER_MOOD_CHECKS_QUEUE)
export class UserMoodChecksProcessor extends ProcessorLogger {
  readonly logger = new Logger(UserMoodChecksProcessor.name);
  constructor(private readonly userMoodCheckService: UserMoodChecksService) {
    super();
  }

  @Process({
    name: UserMoodChecksJob.SAVE_STREAK,
    concurrency: defaultWorkersConcurrency,
  })
  async saveUserMoodCheckStreak(
    job: Bull.Job<{ userId: string; date: string }>,
  ): Promise<string> {
    const { data } = job;
    const result = await this.userMoodCheckService.saveUserMoodCheckStreak(
      data.userId,
      data.date,
    );
    return result;
  }
}
