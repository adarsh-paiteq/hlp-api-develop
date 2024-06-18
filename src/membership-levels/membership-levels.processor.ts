import { defaultWorkersConcurrency } from '@core/configs/bull.config';
import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import Bull from 'bull';
import { ProcessorLogger } from '../core/helpers/processor-logging.helper';
import { PointsAddedEvent } from '../users/user.event';
import {
  membershipLevelsJob,
  MEMBERSHIP_LEVEL_QUEUE,
} from './membership-levels.queue';
import { MembershipLevelsService } from './membership-levels.service';

@Processor(MEMBERSHIP_LEVEL_QUEUE)
export class MembershipLevelsProcessor extends ProcessorLogger {
  readonly logger = new Logger(MembershipLevelsProcessor.name);
  constructor(
    private readonly membershipLevelsService: MembershipLevelsService,
  ) {
    super();
  }

  @Process({
    name: membershipLevelsJob.CHECK_MEMBERSHIP_LEVEL,
    concurrency: defaultWorkersConcurrency,
  })
  async checkMembershipLevel(job: Bull.Job<PointsAddedEvent>): Promise<string> {
    try {
      const { data } = job;
      const result = await this.membershipLevelsService.checkMembershipLevel(
        data,
      );
      return result;
    } catch (error) {
      this.logger.error(`${this.checkMembershipLevel.name}:${error.stack}`);
      throw error;
    }
  }
}
