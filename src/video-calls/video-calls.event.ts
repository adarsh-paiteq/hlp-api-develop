import { ChatType } from '@chats/entities/chat.entity';
import { RoomCreatedEventPayload } from './dto/handle-room-created-event.dto';
import { RoomDestroyedEventPayload } from './dto/handle-room-destroy-event.dto';

export enum VideoCallsEvent {
  ONE_ON_ONE_VIDEO_CALL_INITIATED = '[VIDEO_CALLS] ONE_ON_ONE_VIDEO_CALL_INITIATED',
  GROUP_VIDEO_CALL_INITIATED = '[VIDEO_CALLS] GROUP_VIDEO_CALL_INITIATED',
  VIDEO_CALL_ROOM_CREATED = '[VIDEO_CALLS] VIDEO_CALL_ROOM_CREATED',
  VIDEO_CALL_ROOM_DESTORYED = '[VIDEO_CALLS] VIDEO_CALL_ROOM_DESTORYED',
}

export class VideoCallInitiatedEvent {
  constructor(
    public initiatorUserId: string,
    public receiverUserId: string,
    public roomId: string,
    public roomSubject: string,
    public videoCallType: ChatType,
    public isTest = false,
  ) {}
}

export class GroupVideoCallInitiatedEvent {
  constructor(
    public chatId: string,
    public roomId: string,
    public initiatorUserId: string,
    public roomSubject: string,
    public videoCallType: ChatType,
  ) {}
}

export class VideoCallRoomCreatedEvent {
  constructor(public payload: RoomCreatedEventPayload) {}
}

export class VideoCallRoomDestoryedEvent {
  constructor(public payload: RoomDestroyedEventPayload) {}
}
