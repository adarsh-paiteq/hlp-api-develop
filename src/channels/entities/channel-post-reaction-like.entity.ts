import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ChannelPostReactionLike {
  id: string;
  post_id: string;
  channel_id: string;
  user_id: string;
  reaction_id: string;
  @Field(() => GraphQLISODateTime)
  created_at: string;
  @Field(() => GraphQLISODateTime)
  updated_at: string;
}
