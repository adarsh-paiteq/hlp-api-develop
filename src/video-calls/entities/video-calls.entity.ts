import {
  Field,
  GraphQLISODateTime,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { GraphQLInt } from 'graphql';

export enum VideoCallStatus {
  INITIATED = 'INITIATED',
  ACTIVE = 'ACTIVE',
  ENDED = 'ENDED',
}

registerEnumType(VideoCallStatus, { name: 'VideoCallStatus' });

@ObjectType()
export class VideoCall {
  @Field(() => String)
  id: string;

  @Field(() => String)
  room_id: string;

  @Field(() => String)
  is_timeout: boolean;

  @Field(() => GraphQLInt)
  duration: number;

  @Field(() => VideoCallStatus)
  status: VideoCallStatus;

  @Field(() => GraphQLISODateTime)
  created_at: string;

  @Field(() => GraphQLISODateTime)
  updated_at: string;

  @Field(() => String, { nullable: true })
  channel_id?: string;

  @Field(() => String, { nullable: true })
  chat_id?: string;
}
