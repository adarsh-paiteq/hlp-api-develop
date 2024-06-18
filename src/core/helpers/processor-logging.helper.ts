import {
  OnQueueError,
  OnQueueFailed,
  OnQueueCompleted,
  OnQueuePaused,
  OnQueueStalled,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

export abstract class ProcessorLogger {
  abstract logger: Logger;

  @OnQueueError()
  onQueueError(error: Error): void {
    this.logger.error(`${JSON.stringify(error)}`);
  }

  @OnQueueFailed()
  onQueueFailed(job: Job): void {
    this.logger.error(`Failed ${job.name} ${job.stacktrace}`);
  }

  @OnQueueCompleted()
  onQueueComplated(job: Job, result: unknown): void {
    this.logger.warn(` Completed ${job.name} ${JSON.stringify(result)}`);
  }

  @OnQueuePaused()
  onQueuePaused(): void {
    this.logger.warn(`Queue paused`);
  }

  @OnQueueStalled()
  onQueueStalled(job: Job): void {
    this.logger.warn(`${job.name} is stalled`);
  }
}
