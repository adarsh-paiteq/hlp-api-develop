import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserStatusLogs {
  id: string;
  user_id: string;
  previous_status: string;
  new_status: string;
  status_changed_by: string;
  @Field(() => GraphQLISODateTime)
  updated_at: Date;
  @Field(() => GraphQLISODateTime)
  created_at: Date;
}
