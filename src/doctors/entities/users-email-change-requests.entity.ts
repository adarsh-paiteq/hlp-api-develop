import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UsersEmailChangeRequest {
  id: string;
  user_id: string;
  email: string;
  token: string;
  is_verified: boolean;
  @Field(() => GraphQLISODateTime)
  updated_at: Date;
  @Field(() => GraphQLISODateTime)
  created_at: Date;
}
