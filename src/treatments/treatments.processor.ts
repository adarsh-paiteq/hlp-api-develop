import { Process, Processor } from '@nestjs/bull';
import { TREATMENTS_QUEUE, treatmentsJob } from './treatments.queue';
import { ProcessorLogger } from '@core/helpers/processor-logging.helper';
import { Logger } from '@nestjs/common';
import { defaultWorkersConcurrency } from '@core/configs/bull.config';
import Bull from 'bull';
import { UserSignedUpEvent } from '@users/user.event';
import { TreatmentsService } from './treatments.service';

@Processor(TREATMENTS_QUEUE)
export class TreatmentsProcessor extends ProcessorLogger {
  readonly logger = new Logger(TreatmentsProcessor.name);
  constructor(private readonly treatmentsService: TreatmentsService) {
    super();
  }

  @Process({
    name: treatmentsJob.CREATE_SIGNED_UP_USER_TREATMENT,
    concurrency: defaultWorkersConcurrency,
  })
  async handleCreateSignedUpUserTreatmentJob(
    job: Bull.Job<UserSignedUpEvent>,
  ): Promise<string> {
    try {
      const { data: payload } = job;

      return this.treatmentsService.createSignedUpUserTreatment(payload.user);
    } catch (error) {
      this.logger.error(
        `${this.handleCreateSignedUpUserTreatmentJob.name}:${error.stack}`,
      );
      throw error;
    }
  }
}
