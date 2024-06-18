import { Field, ObjectType } from '@nestjs/graphql';
import { GraphQLInt } from 'graphql';

@ObjectType()
export class UserTookitAnswer {
  id: string;
  toolkit_id: string;
  user_id: string;
  @Field(() => GraphQLInt)
  hlp_points_earned: number;
  session_id: string;
  session_date: string;
  schedule_id: string;
  created_at: string;
  updated_at: string;
}
