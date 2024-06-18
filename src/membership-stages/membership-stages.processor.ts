import { defaultWorkersConcurrency } from '@core/configs/bull.config';
import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import Bull from 'bull';
import { ProcessorLogger } from '../core/helpers/processor-logging.helper';
import { HLPPointsDonatedEvent, PointsAddedEvent } from '../users/user.event';
import {
  membershipStagesJob,
  MEMBERSHIP_STAGE_QUEUE,
} from './membership-stages.queue';
import { MembershipStagesService } from './membership-stages.service';

@Processor(MEMBERSHIP_STAGE_QUEUE)
export class MembershipStagesProcessor extends ProcessorLogger {
  readonly logger = new Logger(MembershipStagesProcessor.name);
  constructor(
    private readonly membershipStageService: MembershipStagesService,
  ) {
    super();
  }

  @Process({
    name: membershipStagesJob.CHECK_MEMBERSHIP_STAGE,
    concurrency: defaultWorkersConcurrency,
  })
  async checkMembershipStage(job: Bull.Job<PointsAddedEvent>): Promise<string> {
    try {
      const { data } = job;
      const result = await this.membershipStageService.checkMembershipStage(
        data,
      );
      return result;
    } catch (error) {
      this.logger.error(`${this.checkMembershipStage.name}:${error.stack}`);
      throw error;
    }
  }

  @Process({
    name: membershipStagesJob.CHECK_MEMBERSHIP_STAGE_HLP_DONATED,
    concurrency: defaultWorkersConcurrency,
  })
  async hanleHlpDonated(job: Bull.Job<HLPPointsDonatedEvent>): Promise<string> {
    try {
      const { data } = job;
      const result = await this.membershipStageService.handleHlpDonated(
        data.donation,
      );
      return result;
    } catch (error) {
      this.logger.error(`${this.hanleHlpDonated.name}:${error.stack}`);
      throw error;
    }
  }
}
