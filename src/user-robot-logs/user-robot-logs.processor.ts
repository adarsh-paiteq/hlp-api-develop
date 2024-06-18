import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { defaultWorkersConcurrency } from '../core/configs/bull.config';
import { ProcessorLogger } from '@core/helpers/processor-logging.helper';
import { UserRobotLogJob, USER_ROBOT_LOG_QUEUE } from './user-robot-logs.queue';
import Bull from 'bull';
import { UserRobotLogsService } from './user-robot-logs.service';
import { UserRobotLogDto } from './dto/user-robot-log.dto';

@Processor(USER_ROBOT_LOG_QUEUE)
export class UserRobotLogsProcessor extends ProcessorLogger {
  readonly logger = new Logger(UserRobotLogsProcessor.name);
  constructor(private readonly userRobotLogsService: UserRobotLogsService) {
    super();
  }

  @Process({
    name: UserRobotLogJob.ADD_LOG,
    concurrency: defaultWorkersConcurrency,
  })
  async addLog(job: Bull.Job<UserRobotLogDto>): Promise<string> {
    const { data } = job;
    this.logger.log('add robot log');
    const savedLog = await this.userRobotLogsService.addLog(data);
    this.logger.log(`user robot log saved ${savedLog.id}`);
    // await this.userSessionLogService.addLog(data.userId, data.date);
    return 'OK';
  }
}
