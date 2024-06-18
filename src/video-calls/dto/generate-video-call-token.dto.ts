import {
  ArgsType,
  Field,
  ObjectType,
  OmitType,
  PickType,
} from '@nestjs/graphql';
import { VideoCall } from '../entities/video-calls.entity';
import { VideoCallMember } from '../entities/video-call-members.entity';
import { IsUUID } from 'class-validator';
import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ChatType } from '@chats/entities/chat.entity';

@ArgsType()
export class GenerateVideoCallTokenArgs {
  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  receiver_user_id: string;
}

@ObjectType()
export class GenerateVideoCallTokenResponse {
  @Field(() => String)
  token: string;

  @Field(() => String)
  url: string;

  @Field(() => String)
  jitsiBaseUrl: string;

  @Field(() => String)
  roomId: string;

  @Field(() => String)
  roomSubject: string;

  @Field(() => ChatType)
  videoCallType: ChatType;
}

export class SaveVideoCallInput extends PickType(VideoCall, [
  'id',
  'room_id',
  'channel_id',
  'chat_id',
]) {}

export class SaveVideoCallMemberInput extends OmitType(VideoCallMember, [
  'id',
  'created_at',
  'updated_at',
]) {}

export interface VideoCallTokenPayload {
  aud: string;
  context: Context;
  exp: number;
  iss: string;
  nbf: number;
  room: string;
  sub: string;
}

export interface Context {
  user: UserPayload;
  features: Features;
  room?: Room;
}

export interface UserPayload {
  id: string;
  name: string;
  avatar?: string;
  email: string;
  moderator: boolean;
}

export interface Features {
  livestreaming: boolean;
  'outbound-call': boolean;
  transcription: boolean;
  recording: boolean;
}

export interface Room {
  regex: boolean;
}
