import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { ProcessorLogger } from '@core/helpers/processor-logging.helper';
import {
  UserSesssionLogJob,
  USER_SESSION_LOG_QUEUE,
} from './user-session-log.queue';
import Bull from 'bull';
import { defaultWorkersConcurrency } from '../core/configs/bull.config';
import { UserSessionLogsService } from './user-session-logs.service';
import { RobotPageType } from '../robots/entities/robot.entity';

@Processor(USER_SESSION_LOG_QUEUE)
export class UserSessionLogProcessor extends ProcessorLogger {
  readonly logger = new Logger(UserSessionLogProcessor.name);
  constructor(private readonly userSessionLogService: UserSessionLogsService) {
    super();
  }

  @Process({
    name: UserSesssionLogJob.ADD_LOG,
    concurrency: defaultWorkersConcurrency,
  })
  async addLog(
    job: Bull.Job<{ userId: string; date: string; page?: RobotPageType }>,
  ): Promise<string> {
    const { data } = job;
    this.logger.log(data);
    await this.userSessionLogService.addLog(data.userId, data.date, data.page);
    return 'OK';
  }
}
