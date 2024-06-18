import { ObjectType, Field, GraphQLISODateTime } from '@nestjs/graphql';
import { GraphQLInt } from 'graphql';

@ObjectType()
export class ChannelPostReactions {
  id: string;
  channel_id: string;
  user_id: string;
  post_id: string;
  message: string;
  @Field(() => String, { nullable: true })
  image_url: string;

  @Field(() => String, { nullable: true })
  image_id: string;

  @Field(() => String, { nullable: true })
  file_path: string;

  @Field(() => String, { nullable: true })
  video_url: string;
  @Field(() => GraphQLInt, { nullable: true })
  total_likes?: number;

  @Field(() => GraphQLInt, { nullable: true })
  total_reactions?: number;
  @Field(() => GraphQLISODateTime)
  created_at: string;
  @Field(() => GraphQLISODateTime)
  updated_at: string;
  is_reaction_disabled_by_admin: boolean;
  is_reaction_disabled_by_user: boolean;

  @Field(() => String, { nullable: true })
  post_reaction_time: string;
}
