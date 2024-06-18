import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import Bull from 'bull';
import { ProcessorLogger } from '../core/helpers/processor-logging.helper';
import { ScheduleSessionDto } from '../schedule-sessions/schedule-sessions.dto';
import { StreakJob, STREAKS_QUEUE } from './streaks.queue';
import { StreaksService } from './streaks.service';
const defaultConcurrency = 20;

@Processor(STREAKS_QUEUE)
export class StreaksProcessor extends ProcessorLogger {
  readonly logger = new Logger(StreaksProcessor.name);
  constructor(private readonly streaksService: StreaksService) {
    super();
  }

  @Process({ name: StreakJob.ADD_STREAK, concurrency: defaultConcurrency })
  async addStreak(job: Bull.Job<ScheduleSessionDto>): Promise<string> {
    try {
      const { data: scheduleSession } = job;
      if (!scheduleSession.tool_kit_id) {
        return `OK`;
      }
      this.logger.log(
        `${scheduleSession.schedule_id} session added check streaks`,
      );
      await this.streaksService.addUserStreak(
        scheduleSession.user_id,
        scheduleSession.tool_kit_id,
      );
      return 'OK';
    } catch (error) {
      this.logger.error(`${this.addStreak.name}:${error.stack}`);
      throw error;
    }
  }
}
