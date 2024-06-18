import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ChannelPostConversation {
  id: string;
  post_id: string;
  channel_id: string;
  user_id: string;
  reaction_id: string;
  // @Field(() => GraphQLISODateTime)
  created_at: string;
  @Field(() => GraphQLISODateTime)
  updated_at: string;
  message: string;
  image_url?: string;
  image_id?: string;
  file_path?: string;
  video_url?: string;
  total_likes?: number;
  is_conversation_disabled_by_admin: boolean;
  is_conversation_disabled_by_user: boolean;
  conversation_time?: string;
}
