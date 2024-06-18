import { ArgsType, Field } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { HasuraEventTriggerOperation } from '../utils/utils.dto';
import { UserRoles } from '../users/users.dto';

export class ChannelPost {
  id: string;
  user_id: string;
  channel_id: string;
  added_by: UserRoles;
}

export class ChannelPostReaction {
  id: string;
  channel_id: string;
  user_id: string;
  post_id: string;
  message: string;
  image_url: string;
  image_id: string;
  file_path: string;
  video_url: string;
  total_likes?: number;
  total_reactions?: number;
  created_at: string;
  updated_at: string;
  is_reaction_disabled_by_admin: boolean;
  is_reaction_disabled_by_user: boolean;
  post_reaction_time: string;
}

export class ChannelPostLike {
  id: string;
  post_id: string;
  user_id: string;
  channel_id: string;
  created_at: string;
  updated_at: string;
}

export enum ChannelRewards {
  HLP_POINTS_FOR_CHANNEL_FOLLOWED = 1,
  HLP_POINTS_FOR_CHANNEL_POST = 1,
  HLP_POINTS_FOR_CHANNEL_POST_REACTION = 1,
  HLP_POINTS_FOR_CHANNEL_POST_REACTION_REPLY = 1,
}

export class Response {
  response: string;
}

export class FollowChannelBody {
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @IsNotEmpty()
  @IsUUID()
  user_id: string;

  @IsNotEmpty()
  @IsUUID()
  channel_id: string;

  @IsNotEmpty()
  @IsBoolean()
  is_channel_unfollowed: boolean;

  created_at?: string;
  updated_at?: string;
}

export class FollowChannelBodyDto {
  @Type(() => FollowChannelBody)
  @ValidateNested()
  @IsObject()
  data: FollowChannelBody;
}

export class ChannelPostBody {
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @IsNotEmpty()
  @IsUUID()
  user_id: string;

  @IsNotEmpty()
  @IsUUID()
  channel_id: string;
}

export class ChannelPostBodyDto {
  @Type(() => ChannelPostBody)
  @ValidateNested()
  @IsObject()
  data: ChannelPostBody;

  @IsOptional()
  @IsString()
  operation?: HasuraEventTriggerOperation;
}

// export class PostReactionBody extends ChannelPostReaction {
//   @IsNotEmpty()
//   @IsUUID()
//   id: string;

//   @IsNotEmpty()
//   @IsUUID()
//   user_id: string;

//   @IsNotEmpty()
//   @IsUUID()
//   channel_id: string;

//   @IsNotEmpty()
//   @IsUUID()
//   post_id: string;
// }

// export class PostReactionBodyDto {
//   @Type(() => PostReactionBody)
//   @ValidateNested()
//   @IsObject()
//   data: PostReactionBody;
// }

export class ImageInput {
  user_id: string;
  post_id: string;
  image_url: string;
  image_id?: string;
  file_path?: string;
}
export class VideoInput {
  user_id: string;
  post_id: string;
  thumb_nail_image_url?: string;
  thumbnail_image_id?: string;
  thumbnail_image_id_path?: string;
  video_url: string;
  video_id?: string;
  video_path?: string;
}
export class PostLikeBody extends ChannelPostLike {
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @IsNotEmpty()
  @IsUUID()
  user_id: string;

  @IsNotEmpty()
  @IsUUID()
  channel_id: string;

  @IsNotEmpty()
  @IsUUID()
  post_id: string;
}
export class PostLikeBodyDto {
  @Type(() => PostLikeBody)
  @ValidateNested()
  @IsObject()
  data: PostLikeBody;
}

@ArgsType()
export class GetReactionConversationsArgs {
  @Field()
  @IsUUID()
  reactionId: string;
}
export class ChannelPostData {
  user_id: string;
}
