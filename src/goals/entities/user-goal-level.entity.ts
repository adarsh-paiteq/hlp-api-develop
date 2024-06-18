import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserGoalLevel {
  id: string;
  user_id: string;
  goal_level_id: string;
  created_at: string;
  updated_at: string;
}
