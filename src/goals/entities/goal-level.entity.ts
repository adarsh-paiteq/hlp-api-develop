import { HideField, ObjectType } from '@nestjs/graphql';
import { Translation } from '@utils/utils.dto';

@ObjectType()
export class GoalLevel {
  id: string;
  title: string;
  short_description: string;
  goal_id: string;
  hlp_reward_points_to_complete_goal: number;
  hlp_reward_points_to_be_awarded: number;
  sequence_number: number;
  created_at: string;
  updated_at: string;
  color: string;
  @HideField()
  translations?: Translation;
}
