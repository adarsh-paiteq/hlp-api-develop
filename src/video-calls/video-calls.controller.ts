import { Body, Controller, Post } from '@nestjs/common';
import { VideoCallsService } from './video-calls.service';
import { Public } from '@shared/decorators/public.decorator';
import { RoomDestroyedEventPayload } from './dto/handle-room-destroy-event.dto';
import { OccupantJoinedEventPayload } from './dto/handle-occupant-joined-event.dto';
import { OccupantLeftEventPayload } from './dto/handle-occupant-left-event.dto';
import { RoomCreatedEventPayload } from './dto/handle-room-created-event.dto';

@Controller('video-call')
export class VideoCallsController {
  constructor(private readonly videoCallsService: VideoCallsService) {}

  @Public()
  @Post('/events/room/created')
  async handleRoomCreatedEvent(
    @Body() body: RoomCreatedEventPayload,
  ): Promise<string> {
    return this.videoCallsService.handleRoomCreatedEvent(body);
  }

  @Public()
  @Post('/events/occupant/joined')
  async handleOccupantJoinedEvent(
    @Body() body: OccupantJoinedEventPayload,
  ): Promise<string> {
    return this.videoCallsService.handleOccupantJoinedEvent(body);
  }

  @Public()
  @Post('/events/occupant/left')
  async handleOccupantLeftEvent(
    @Body() body: OccupantLeftEventPayload,
  ): Promise<string> {
    return this.videoCallsService.handleOccupantLeftEvent(body);
  }

  @Public()
  @Post('/events/room/destroyed')
  async handleRoomDestroyedEvent(
    @Body() body: RoomDestroyedEventPayload,
  ): Promise<string> {
    return this.videoCallsService.handleRoomDestroyedEvent(body);
  }
}
