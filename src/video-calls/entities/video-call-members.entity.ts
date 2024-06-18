import {
  Field,
  GraphQLISODateTime,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';

export enum VideoCallMemberStatus {
  JOINED = 'JOINED',
  REJECTED = 'REJECTED',
  LEFT = 'LEFT',
  CALLING = 'CALLING',
}

registerEnumType(VideoCallMemberStatus, { name: 'VideoCallMemberStatus' });

@ObjectType()
export class VideoCallMember {
  @Field(() => String)
  id: string;

  @Field(() => String)
  video_call_id: string;

  @Field(() => String)
  user_id: string;

  @Field(() => Boolean)
  is_moderator: boolean;

  @Field(() => Boolean)
  is_owner: boolean;

  @Field(() => String)
  token: string;

  @Field(() => String)
  url: string;

  @Field(() => VideoCallMemberStatus)
  status: VideoCallMemberStatus;

  @Field(() => GraphQLISODateTime)
  created_at: string;

  @Field(() => GraphQLISODateTime)
  updated_at: string;
}
