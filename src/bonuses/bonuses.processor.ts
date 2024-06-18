import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import Bull from 'bull';
import { defaultWorkersConcurrency } from '@core/configs/bull.config';
import { BonusesJob, BONUSES_QUEUE } from './bonuses.queue';

import { BonusesService } from './bonuses.service';
import { ProcessorLogger } from '../core/helpers/processor-logging.helper';

@Processor(BONUSES_QUEUE)
export class BonusesProcessor extends ProcessorLogger {
  readonly logger = new Logger(BonusesProcessor.name);
  constructor(private readonly bonusesService: BonusesService) {
    super();
  }

  @Process({
    name: BonusesJob.CHECK_CHECKIN_BONUS,
    concurrency: defaultWorkersConcurrency,
  })
  async checkCheckinBonus(job: Bull.Job<string>): Promise<string> {
    try {
      const { data: userId } = job;
      const result = await this.bonusesService.getCheckinBonus({ userId });
      return result.message;
    } catch (error) {
      this.logger.error(`${this.checkCheckinBonus.name}:${error.stack}`);
      throw error;
    }
  }

  @Process({
    name: BonusesJob.CHECK_TOOLKIT_BONUS,
    concurrency: defaultWorkersConcurrency,
  })
  async checkToolkitBonus(job: Bull.Job<string>): Promise<string> {
    try {
      const { data: userId } = job;
      const result = await this.bonusesService.getToolkitBonus({ userId });
      return result.message;
    } catch (error) {
      this.logger.error(`${this.checkToolkitBonus.name}:${error.stack}`);
      throw error;
    }
  }

  @Process({
    name: BonusesJob.CHECK_TROPHY_BONUS,
    concurrency: defaultWorkersConcurrency,
  })
  async checkTrophyBonus(job: Bull.Job<string>): Promise<string> {
    try {
      const { data: userId } = job;
      const result = await this.bonusesService.getTrophyBonus({ userId });
      return result.message;
    } catch (error) {
      this.logger.error(`${this.checkTrophyBonus.name}:${error.stack}`);
      throw error;
    }
  }
}
