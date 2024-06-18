import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AdminPostChallenge {
  id: string;
  post_id: string;
  challenge_id: string;
  @Field(() => GraphQLISODateTime)
  created_at: string;
  @Field(() => GraphQLISODateTime)
  updated_at: string;
}
