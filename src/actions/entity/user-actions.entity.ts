import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';
@ObjectType()
export class UserActions {
  voucher_code: string;
  user_id: string;
  @Field(() => GraphQLISODateTime)
  created_at: string;
  @Field(() => GraphQLISODateTime)
  updated_at: string;
  action_id: string;
  id: string;
}
