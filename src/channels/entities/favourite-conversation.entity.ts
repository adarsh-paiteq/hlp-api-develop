import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class FavouriteConversation {
  id: string;
  post_id: string;
  user_id: string;
  conversation_creator_id?: string;
  reaction_id: string;
  conversation_id: string;
  @Field(() => GraphQLISODateTime)
  created_at: string;
  @Field(() => GraphQLISODateTime)
  updated_at: string;
}
