import { defaultJobOptions } from '@core/configs/bull.config';
import { BullModule, BullModuleOptions, InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { RoomCreatedEventPayload } from './dto/handle-room-created-event.dto';
import { RoomDestroyedEventPayload } from './dto/handle-room-destroy-event.dto';

export const VIDEO_CALLS_QUEUE = 'video-calls';
export const videoCallsQueueConfig: BullModuleOptions = {
  name: VIDEO_CALLS_QUEUE,
  defaultJobOptions: defaultJobOptions,
};

export const registerVideoCallsQueue = BullModule.registerQueueAsync(
  videoCallsQueueConfig,
);

export enum VideoCallsJob {
  SET_VIDEO_CALL_STATUS_TO_ACTIVE = '[ VIDEO-CALLS ] SET_VIDEO_CALL_STATUS_TO_ACTIVE',
  SET_VIDEO_CALL_STATUS_TO_ENDED = '[ VIDEO-CALLS ] SET_VIDEO_CALL_STATUS_TO_ENDED',
}

@Injectable()
export class VideoCallsQueue {
  constructor(
    @InjectQueue(VIDEO_CALLS_QUEUE) private readonly videoCallsQueue: Queue,
  ) {}

  async addSetVideoCallStatusToActiveJob(
    payload: RoomCreatedEventPayload,
  ): Promise<void> {
    await this.videoCallsQueue.add(
      VideoCallsJob.SET_VIDEO_CALL_STATUS_TO_ACTIVE,
      payload,
    );
  }

  async addSetVideoCallStatusToEndedJob(
    payload: RoomDestroyedEventPayload,
  ): Promise<void> {
    await this.videoCallsQueue.add(
      VideoCallsJob.SET_VIDEO_CALL_STATUS_TO_ENDED,
      payload,
    );
  }
}
