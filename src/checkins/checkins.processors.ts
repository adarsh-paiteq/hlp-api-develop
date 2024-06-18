import { defaultWorkersConcurrency } from '@core/configs/bull.config';
import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import Bull from 'bull';
import { ProcessorLogger } from '../core/helpers/processor-logging.helper';
import { ScheduleSessionAddedEvent } from '../schedule-sessions/schedule-sessions.event';
import { checkinsJob, CHECKINS_QUEUE } from './checkins.queue';
import { CheckinsService } from './checkins.service';

@Processor(CHECKINS_QUEUE)
export class CheckinsProcessor extends ProcessorLogger {
  readonly logger = new Logger(CheckinsProcessor.name);
  constructor(private readonly checkinsService: CheckinsService) {
    super();
  }

  @Process({
    name: checkinsJob.CHECK_CHECKIN_LEVEL,
    concurrency: defaultWorkersConcurrency,
  })
  async checkCheckinLevel(
    job: Bull.Job<ScheduleSessionAddedEvent>,
  ): Promise<string> {
    try {
      const {
        data: {
          scheduleSession: { user_id },
        },
      } = job;
      const result = await this.checkinsService.getUserNextCheckinLevel(
        user_id,
      );
      return result.message;
    } catch (error) {
      this.logger.error(`${this.checkCheckinLevel.name}:${error.stack}`);
      throw error;
    }
  }
}
