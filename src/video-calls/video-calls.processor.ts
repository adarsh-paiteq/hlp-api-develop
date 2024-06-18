import { ProcessorLogger } from '@core/helpers/processor-logging.helper';
import { Process, Processor } from '@nestjs/bull';
import { VIDEO_CALLS_QUEUE, VideoCallsJob } from './video-calls.queue';
import { Logger } from '@nestjs/common';
import { VideoCallsService } from './video-calls.service';
import { defaultWorkersConcurrency } from '@core/configs/bull.config';
import Bull from 'bull';
import { RoomCreatedEventPayload } from './dto/handle-room-created-event.dto';
import { RoomDestroyedEventPayload } from './dto/handle-room-destroy-event.dto';

@Processor(VIDEO_CALLS_QUEUE)
export class VideoCallsProcessor extends ProcessorLogger {
  readonly logger = new Logger(VideoCallsProcessor.name);
  constructor(private readonly videoCallsService: VideoCallsService) {
    super();
  }

  @Process({
    name: VideoCallsJob.SET_VIDEO_CALL_STATUS_TO_ACTIVE,
    concurrency: defaultWorkersConcurrency,
  })
  async handleSetVideoCallStatusToActiveJob(
    job: Bull.Job<RoomCreatedEventPayload>,
  ): Promise<string> {
    try {
      const { data: payload } = job;
      return await this.videoCallsService.setVideoCallStatusToActive(payload);
    } catch (error) {
      this.logger.error(
        `${this.handleSetVideoCallStatusToActiveJob.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: VideoCallsJob.SET_VIDEO_CALL_STATUS_TO_ENDED,
    concurrency: defaultWorkersConcurrency,
  })
  async handleSetVideoCallStatusToEndedJob(
    job: Bull.Job<RoomDestroyedEventPayload>,
  ): Promise<string> {
    try {
      const { data: payload } = job;
      return await this.videoCallsService.setVideoCallStatusToEnded(payload);
    } catch (error) {
      this.logger.error(
        `${this.handleSetVideoCallStatusToEndedJob.name}:${error.stack}`,
      );
      throw error;
    }
  }
}
