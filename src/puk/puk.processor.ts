import { Process, Processor } from '@nestjs/bull';
import Bull from 'bull';
import { defaultWorkersConcurrency } from '@core/configs/bull.config';
import { ProcessorLogger } from '@core/helpers/processor-logging.helper';
import { Users } from '../users/users.model';
import { PukJob, PUK_QUEUE } from './puk.queue';
import { PukService } from './puk.service';
import { Logger } from '@nestjs/common';

@Processor(PUK_QUEUE)
export class PukProcessor extends ProcessorLogger {
  logger: Logger = new Logger(PukProcessor.name);
  constructor(private readonly pukService: PukService) {
    super();
  }

  @Process({
    name: PukJob.CONFIRM_REGISTRATION,
    concurrency: defaultWorkersConcurrency,
  })
  async confirmRegistration(job: Bull.Job<Users>): Promise<string> {
    const { data } = job;
    this.logger.log(`confirm registration of ${data.user_name}`);
    const result = await this.pukService.confirmRegistration(data);
    return result;
  }

  @Process({
    name: PukJob.LOG_ACTIVITY,
    concurrency: defaultWorkersConcurrency,
  })
  async logActivity(job: Bull.Job<Users>): Promise<string> {
    const { data } = job;
    const result = await this.pukService.logActivity(data);
    return result;
  }
}
