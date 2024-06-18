import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserReportedReaction {
  id: string;
  post_id: string;
  reaction_id: string;
  user_id: string;
  reason: string;
  extra_information: string;
  @Field(() => GraphQLISODateTime)
  created_at: string;
  @Field(() => GraphQLISODateTime)
  updated_at: string;
}
