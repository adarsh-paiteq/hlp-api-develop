import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class FavouriteReaction {
  id: string;
  post_id: string;
  user_id: string;
  reaction_id: string;
  reaction_creator_id?: string;
  @Field(() => GraphQLISODateTime)
  created_at: string;
  @Field(() => GraphQLISODateTime)
  updated_at: string;
}
