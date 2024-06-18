import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserBonusClaimed {
  @Field(() => String)
  id: string;
  @Field(() => String)
  user_id: string;
  @Field(() => String)
  bonus_id: string;
  @Field(() => GraphQLISODateTime)
  created_at: string;
  @Field(() => GraphQLISODateTime)
  updated_at: string;
}
