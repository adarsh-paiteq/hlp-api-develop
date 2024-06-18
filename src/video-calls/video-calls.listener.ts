import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  VideoCallRoomCreatedEvent,
  VideoCallRoomDestoryedEvent,
  VideoCallsEvent,
} from './video-calls.event';
import { VideoCallsQueue } from './video-calls.queue';

@Injectable()
export class VideoCallsListener {
  private readonly logger = new Logger(VideoCallsListener.name);
  constructor(private readonly videoCallsQueue: VideoCallsQueue) {}

  @OnEvent(VideoCallsEvent.VIDEO_CALL_ROOM_CREATED)
  async handleVideoCallRoomCreatedEvent(
    data: VideoCallRoomCreatedEvent,
  ): Promise<void> {
    const { payload } = data;
    await this.videoCallsQueue.addSetVideoCallStatusToActiveJob(payload);
  }

  @OnEvent(VideoCallsEvent.VIDEO_CALL_ROOM_DESTORYED)
  async handleVideoCallRoomDestoryedEvent(
    data: VideoCallRoomDestoryedEvent,
  ): Promise<void> {
    const { payload } = data;
    await this.videoCallsQueue.addSetVideoCallStatusToEndedJob(payload);
  }
}
