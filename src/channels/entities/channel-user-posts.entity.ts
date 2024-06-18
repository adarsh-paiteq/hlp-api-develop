import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { GraphQLInt } from 'graphql';

export enum PostType {
  CHALLENGE = 'CHALLENGE',
  TOOLS_WE_LOVE = 'TOOLS_WE_LOVE',
  SMART_TIP = 'SMART_TIP',
  TOOL_SPOT_LIGHT = 'TOOL_SPOT_LIGHT',
  STORY = 'STORY',
  POLL = 'POLL',
}

export enum ChannelUserPostType {
  STORY = 'STORY',
  POST = 'POST',
}

export enum AddedBy {
  user = 'user',
  admin = 'admin',
}

registerEnumType(AddedBy, { name: 'AddedBy' });
registerEnumType(PostType, { name: 'PostType' });
registerEnumType(ChannelUserPostType, { name: 'ChannelUserPostType' });

@ObjectType()
export class ChannelUserPostStoryImage {
  file_id: string;
  file_path: string;
  image_url: string;
}

@ObjectType()
export class ChannelUserPost {
  is_post_disabled_by_admin: boolean;
  is_post_disabled_by_user: boolean;

  @Field(() => GraphQLInt, { nullable: true })
  total_likes?: number;

  @Field(() => GraphQLInt, { nullable: true })
  total_reactions?: number;

  @Field(() => AddedBy)
  added_by: AddedBy;

  @Field(() => String, { nullable: true })
  file_path?: string;

  @Field(() => String, { nullable: true })
  image_id?: string;

  @Field(() => String, { nullable: true })
  image_url?: string;

  message: string;

  @Field(() => PostType, { nullable: true })
  post_type?: PostType;

  @Field(() => String, { nullable: true })
  sub_title?: string;

  @Field(() => String, { nullable: true })
  title?: string;

  @Field(() => String, { nullable: true })
  video_url?: string;

  created_at: string;
  updated_at: string;

  @Field(() => String, { nullable: true })
  post_time?: string;
  channel_id: string;
  id: string;
  user_id: string;

  @Field(() => ChannelUserPostType, { nullable: true })
  type?: ChannelUserPostType;
}
