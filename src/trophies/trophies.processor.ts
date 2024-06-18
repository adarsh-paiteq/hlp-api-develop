import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { TrophiesJob, TROPHIES_QUEUE } from './trophies.queue';
import { TrophiesService } from './trophies.service';
import Bull from 'bull';
import { CheckTrophies } from './trophies.dto';
import { defaultWorkersConcurrency } from '@core/configs/bull.config';
import { ProcessorLogger } from '@core/helpers/processor-logging.helper';
@Processor(TROPHIES_QUEUE)
export class TrophiesProcessor extends ProcessorLogger {
  readonly logger = new Logger(TrophiesProcessor.name);
  constructor(private readonly trophiesService: TrophiesService) {
    super();
  }

  /**
   * @description Processors are used in the trophies listener.
   */
  @Process({
    name: TrophiesJob.CHECK_TROPHIES,
    concurrency: defaultWorkersConcurrency,
  })
  async checkTrophiesAchieved(job: Bull.Job<CheckTrophies>): Promise<string> {
    try {
      const { data: checkTrophiesData } = job;
      this.logger.log(
        `User ${checkTrophiesData.user_id} checking for ${checkTrophiesData.trophy_type} Trophy`,
      );
      const { response } =
        await this.trophiesService.checkAndSaveAchievedTrophies(
          checkTrophiesData,
        );
      this.logger.log(response);
      return response;
    } catch (error) {
      this.logger.error(`${this.checkTrophiesAchieved.name}:${error.stack}`);
      throw error;
    }
  }
}
