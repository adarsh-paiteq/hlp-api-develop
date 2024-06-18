import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { RoomCreatedEventPayload } from './dto/handle-room-created-event.dto';
import { RoomDestroyedEventPayload } from './dto/handle-room-destroy-event.dto';
import { OccupantJoinedEventPayload } from './dto/handle-occupant-joined-event.dto';
import { OccupantLeftEventPayload } from './dto/handle-occupant-left-event.dto';
import {
  GenerateVideoCallTokenResponse,
  SaveVideoCallInput,
  SaveVideoCallMemberInput,
  UserPayload,
  VideoCallTokenPayload,
} from './dto/generate-video-call-token.dto';
import { VideoCallsRepo } from './video-calls.repo';

import { v4 as uuidv4 } from 'uuid';
import { DateTime } from 'luxon';
import { VideoCallMemberStatus } from './entities/video-call-members.entity';
import { ConfigService } from '@nestjs/config';
import { EnvVariable } from '@core/configs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  GroupVideoCallInitiatedEvent,
  VideoCallRoomCreatedEvent,
  VideoCallInitiatedEvent,
  VideoCallsEvent,
  VideoCallRoomDestoryedEvent,
} from './video-calls.event';
import { UserRoles } from '../users/users.dto';
import { Doctor } from '../doctors/entities/doctors.entity';
import { Users } from '../users/users.model';
import { AuthService } from '@shared/auth/auth.service';
import {
  StartVideoCallArgs,
  StartVideoCallResponse,
} from './dto/start-video-call.dto';
import { ChatType } from '@chats/entities/chat.entity';
import { VideoCallStatus } from './entities/video-calls.entity';
import { ChatsRepo } from '@chats/chats.repo';
import { Treatment } from '@treatments/entities/treatments.entity';

@Injectable()
export class VideoCallsService {
  private readonly logger = new Logger(VideoCallsService.name);
  constructor(
    private readonly videoCallsRepo: VideoCallsRepo,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
    private readonly chatsRepo: ChatsRepo,
  ) {}

  async handleRoomCreatedEvent(
    payload: RoomCreatedEventPayload,
  ): Promise<string> {
    this.eventEmitter.emit(
      VideoCallsEvent.VIDEO_CALL_ROOM_CREATED,
      new VideoCallRoomCreatedEvent(payload),
    );
    return 'room created ';
  }

  async handleRoomDestroyedEvent(
    payload: RoomDestroyedEventPayload,
  ): Promise<string> {
    this.eventEmitter.emit(
      VideoCallsEvent.VIDEO_CALL_ROOM_DESTORYED,
      new VideoCallRoomDestoryedEvent(payload),
    );
    return 'room Destroyed ';
  }

  async handleOccupantJoinedEvent(
    data: OccupantJoinedEventPayload,
  ): Promise<string> {
    this.logger.log(data);
    return 'Occupent Joined';
  }

  async handleOccupantLeftEvent(
    data: OccupantLeftEventPayload,
  ): Promise<string> {
    this.logger.log(data);
    return 'Occupent Left';
  }

  async createVideoCallToken(
    roomId: string,
    user: UserPayload,
  ): Promise<string> {
    const dateTime = DateTime.now();
    const currentTime = dateTime.toSeconds();
    const expirationMinutes = this.configService.getOrThrow<number>(
      EnvVariable.JITSI_TOKEN_EXPIRATION_IN_MINUTES,
    );
    const jitsiAppId = this.configService.getOrThrow<string>(
      EnvVariable.JITSI_APP_ID,
    );
    const jitsiHost = this.configService.getOrThrow<string>(
      EnvVariable.JITSI_HOST,
    );

    const expirationTime = dateTime
      .plus({ minutes: expirationMinutes })
      .toSeconds();

    /**
     * @description https://developer.8x8.com/jaas/docs/api-keys-jwt
     */
    const payload: VideoCallTokenPayload = {
      aud: 'jitsi',
      context: {
        user: user,
        features: {
          livestreaming: true,
          'outbound-call': false,
          transcription: true,
          recording: true,
        },
        room: {
          regex: false,
        },
      },
      exp: expirationTime,
      iss: jitsiAppId,
      nbf: currentTime,
      room: roomId,
      sub: jitsiHost,
    };

    const token = await this.authService.generateVideoCallToken(payload);
    return token;
  }

  async getUserTokenAndUrl(
    userId: string,
    roomId: string,
    roomSubject: string,
    videoCallType: ChatType,
    isModerator = false,
  ): Promise<{
    token: string;
    url: string;
    jitsiBaseUrl: string;
    user: Users;
  }> {
    const user = await this.videoCallsRepo.getUserById(userId);
    if (!user) {
      throw new NotFoundException(`video_calls.user_not_found`);
    }
    const jitsiHost = this.configService.getOrThrow<string>(
      EnvVariable.JITSI_HOST,
    );

    const userName =
      user.first_name && user.last_name
        ? `${user.first_name} ${user.last_name}`
        : user.user_name;

    const userPayload: UserPayload = {
      avatar:
        user.role === UserRoles.DOCTOR
          ? (user as unknown as Doctor).image_url
          : user.avatar_image_name,
      email: user.email,
      id: user.id,
      moderator: isModerator,
      name: userName,
    };

    const token = await this.createVideoCallToken(roomId, userPayload);
    const jitsiBaseUrl = `https://${jitsiHost}`;
    const encodedSubject = `${encodeURIComponent(`"${roomSubject}"`)}`;
    const roomSubjectQuery =
      videoCallType === ChatType.CHANNEL
        ? `#config.subject=${encodedSubject}`
        : videoCallType === ChatType.ONE_ON_ONE
        ? `#config.localSubject=${encodedSubject}`
        : '';
    const url = `${jitsiBaseUrl}/${roomId}?jwt=${token}${roomSubjectQuery}`;

    return { token, url, jitsiBaseUrl, user };
  }

  async saveVideoCallMembers(
    roomId: string,
    userId: string,
    token: string,
    url: string,
    channelId?: string,
    chatId?: string,
  ): Promise<void> {
    const videoCallId = uuidv4();
    const saveVideoCallInput: SaveVideoCallInput = {
      id: videoCallId,
      room_id: roomId,
    };
    if (channelId) {
      saveVideoCallInput.channel_id = channelId;
    }
    if (chatId) {
      saveVideoCallInput.chat_id = chatId;
    }

    const saveVideoCallMemberInput: SaveVideoCallMemberInput = {
      video_call_id: videoCallId,
      is_moderator: true,
      is_owner: true,
      status: VideoCallMemberStatus.CALLING,
      token: token,
      url: url,
      user_id: userId,
    };

    await this.videoCallsRepo.insertVideoCall(saveVideoCallInput);
    await this.videoCallsRepo.insertVideoCallMember(saveVideoCallMemberInput);
  }

  getOneOnOneRoomSubject(user: Users): string {
    const roomSubject =
      user.first_name && user.last_name
        ? `${user.first_name.trim()} ${user.last_name.trim()}`
        : user.user_name.trim();

    return roomSubject;
  }

  async startOneOnOneVideoCall(
    initiatorUserId: string,
    args: StartVideoCallArgs,
  ): Promise<GenerateVideoCallTokenResponse> {
    const {
      chatType: videoCallType,
      id: receiverUserId,
      treatment_id: treatmentId,
    } = args;

    const roomId = uuidv4();

    const requests: [Promise<Users | null>?, Promise<Treatment>?] = [
      this.videoCallsRepo.getUserById(receiverUserId),
    ];

    if (treatmentId) {
      const treatmentRequest =
        this.videoCallsRepo.getTreatmentById(treatmentId);

      requests.push(treatmentRequest);
    }

    const [receiverUser, treatment] = await Promise.all(requests);

    if (!receiverUser) {
      throw new NotFoundException(`video_calls.call_receiver_user_not_found`);
    }

    if (treatmentId && !treatment) {
      throw new NotFoundException(`video_calls.treatment_not_found`);
    }

    const chat = await this.chatsRepo.getOneOnOneChat(
      initiatorUserId,
      receiverUserId,
      treatmentId,
    );

    if (!chat) {
      throw new NotFoundException(
        'video_calls.chat_not_initiated_please_start_chat',
      );
    }

    const videoCall = await this.videoCallsRepo.getActiveOneOnOneVideoCall(
      chat.id,
    );

    const roomSubject = this.getOneOnOneRoomSubject(receiverUser);

    if (videoCall) {
      return await this.joinExistingVideoCall(
        initiatorUserId,
        videoCall.id,
        videoCall.room_id,
        roomSubject,
        videoCallType,
      );
    }

    const initiator = await this.getUserTokenAndUrl(
      initiatorUserId,
      roomId,
      roomSubject,
      videoCallType,
      true,
    );

    await this.saveVideoCallMembers(
      roomId,
      initiatorUserId,
      initiator.token,
      initiator.url,
      undefined,
      chat.id,
    );

    this.eventEmitter.emit(
      VideoCallsEvent.ONE_ON_ONE_VIDEO_CALL_INITIATED,
      new VideoCallInitiatedEvent(
        initiatorUserId,
        receiverUserId,
        roomId,
        roomSubject,
        videoCallType,
      ),
    );

    return {
      token: initiator.token,
      url: initiator.url,
      jitsiBaseUrl: initiator.jitsiBaseUrl,
      roomId,
      roomSubject,
      videoCallType,
    };
  }

  async joinExistingVideoCall(
    userId: string,
    videoCallId: string,
    roomId: string,
    roomSubject: string,
    videoCallType: ChatType,
  ): Promise<GenerateVideoCallTokenResponse> {
    const videoCallMember = await this.videoCallsRepo.getVideoCallMember(
      videoCallId,
      userId,
    );

    const { jitsiBaseUrl, token, url } = await this.getUserTokenAndUrl(
      userId,
      roomId,
      roomSubject,
      videoCallType,
      videoCallMember?.is_moderator || false,
    );

    if (!videoCallMember) {
      const saveVideoCallMemberInput: SaveVideoCallMemberInput = {
        video_call_id: videoCallId,
        status: VideoCallMemberStatus.CALLING,
        token: token,
        url: url,
        user_id: userId,
        is_moderator: false,
        is_owner: false,
      };
      await this.videoCallsRepo.insertVideoCallMember(saveVideoCallMemberInput);
    }
    return {
      token: token,
      url: url,
      jitsiBaseUrl: jitsiBaseUrl,
      roomId,
      roomSubject,
      videoCallType,
    };
  }

  async startGroupVideoCall(
    userId: string,
    chatId: string,
  ): Promise<GenerateVideoCallTokenResponse> {
    const roomId = uuidv4();
    const videoCallType = ChatType.CHANNEL;

    const chat = await this.videoCallsRepo.getChatByChatIdAndUserId(
      chatId,
      userId,
    );
    if (!chat || !chat.channel_id) {
      throw new NotFoundException(`video_calls.chat_not_found`);
    }
    const videoCall = await this.videoCallsRepo.getActiveGroupVideoCall(
      chat.channel_id,
    );

    if (videoCall) {
      return this.joinExistingVideoCall(
        userId,
        videoCall.id,
        videoCall.room_id,
        chat.group_title,
        videoCallType,
      );
    }

    const initiator = await this.getUserTokenAndUrl(
      userId,
      roomId,
      chat.group_title,
      videoCallType,
      true,
    );

    await this.saveVideoCallMembers(
      roomId,
      userId,
      initiator.token,
      initiator.url,
      chat.channel_id,
      chat.id,
    );

    this.eventEmitter.emit(
      VideoCallsEvent.GROUP_VIDEO_CALL_INITIATED,
      new GroupVideoCallInitiatedEvent(
        chatId,
        roomId,
        userId,
        chat.group_title,
        videoCallType,
      ),
    );

    return {
      token: initiator.token,
      url: initiator.url,
      jitsiBaseUrl: initiator.jitsiBaseUrl,
      roomId,
      roomSubject: chat.group_title,
      videoCallType,
    };
  }

  async generateVideoCallToken(
    userId: string,
    receiverUserId: string,
  ): Promise<GenerateVideoCallTokenResponse> {
    return await this.startOneOnOneVideoCall(userId, {
      chatType: ChatType.ONE_ON_ONE,
      id: receiverUserId,
    });
  }

  async startVideoCall(
    userId: string,
    args: StartVideoCallArgs,
  ): Promise<StartVideoCallResponse> {
    const { id, chatType } = args;

    if (chatType === ChatType.ONE_ON_ONE) {
      return await this.startOneOnOneVideoCall(userId, args);
    }

    if (chatType === ChatType.CHANNEL) {
      return await this.startGroupVideoCall(userId, id);
    }

    throw new BadRequestException(`video_calls.invalid_input`);
  }

  async generateTestVideoCallToken(
    userId: string,
    receiverUserId: string,
  ): Promise<GenerateVideoCallTokenResponse> {
    const roomId = uuidv4();
    const videoCallType = ChatType.ONE_ON_ONE;
    const receiverUser = await this.videoCallsRepo.getUserById(receiverUserId);
    if (!receiverUser) {
      throw new NotFoundException(`video_calls.call_receiver_user_not_found`);
    }
    const roomSubject = this.getOneOnOneRoomSubject(receiverUser);
    const initiator = await this.getUserTokenAndUrl(
      userId,
      roomId,
      roomSubject,
      videoCallType,
      true,
    );

    this.eventEmitter.emit(
      VideoCallsEvent.ONE_ON_ONE_VIDEO_CALL_INITIATED,
      new VideoCallInitiatedEvent(
        userId,
        receiverUserId,
        roomId,
        roomSubject,
        videoCallType,
        true,
      ),
    );

    return {
      token: initiator.token,
      url: initiator.url,
      jitsiBaseUrl: initiator.jitsiBaseUrl,
      roomId,
      roomSubject,
      videoCallType,
    };
  }

  async setVideoCallStatusToActive(
    payload: RoomCreatedEventPayload,
  ): Promise<string> {
    const { room_name: roomId } = payload;
    const videoCall = await this.videoCallsRepo.updateVideoCallStatus(
      roomId,
      VideoCallStatus.ACTIVE,
    );
    return `Video Call staus Updated to ${videoCall.status}`;
  }

  async setVideoCallStatusToEnded(
    payload: RoomDestroyedEventPayload,
  ): Promise<string> {
    const { room_name: roomId, all_occupants } = payload;

    const videoCall = await this.videoCallsRepo.updateVideoCallStatus(
      roomId,
      VideoCallStatus.ENDED,
    );
    const userIds = all_occupants.map((occupants) => {
      return occupants.id;
    });
    await this.videoCallsRepo.updateVideoCallMemberStatus(
      userIds,
      videoCall.id,
      VideoCallMemberStatus.LEFT,
    );
    return `Video Call staus Updated to ${videoCall.status}`;
  }
}
