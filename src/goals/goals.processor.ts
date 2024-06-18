import { defaultWorkersConcurrency } from '@core/configs/bull.config';
import { ProcessorLogger } from '@core/helpers/processor-logging.helper';
import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import Bull from 'bull';
import { CheckGoalLevel } from './goals.dto';
import { GoalsJob, GOALS_QUEUE } from './goals.queue';
import { GoalsService } from './goals.service';

@Processor(GOALS_QUEUE)
export class GoalsProcessor extends ProcessorLogger {
  readonly logger = new Logger(GoalsProcessor.name);
  constructor(private readonly goalsService: GoalsService) {
    super();
  }

  @Process({
    name: GoalsJob.CHECK_GOAL_LEVEL,
    concurrency: defaultWorkersConcurrency,
  })
  async checkGoalLevelProcessor(
    job: Bull.Job<CheckGoalLevel>,
  ): Promise<string> {
    const { data: checkGoalLevel } = job;
    try {
      const data = await this.goalsService.checkGoalLevel(
        checkGoalLevel.tool_kit_id,
        checkGoalLevel.user_id,
      );
      this.logger.log(data);
      return 'OK';
    } catch (error) {
      this.logger.error(`${this.checkGoalLevelProcessor.name}:${error.stack}`);
      throw error;
    }
  }

  @Process({
    name: GoalsJob.ADDED_USER_GOAL,
    concurrency: defaultWorkersConcurrency,
  })
  async handleAddDefaultUserGoalJob(
    job: Bull.Job<{ userId: string }>,
  ): Promise<string> {
    try {
      const { userId } = job.data;
      return await this.goalsService.addDefaultUserGoal(userId);
    } catch (error) {
      this.logger.error(
        `${this.handleAddDefaultUserGoalJob.name}:${error.stack}`,
      );
      throw error;
    }
  }
}
