import { Field, Int, ObjectType } from '@nestjs/graphql';
@ObjectType()
export class UserChallenge {
  is_goal_completed: boolean;
  is_winner: boolean;
  @Field(() => Int)
  hlp_points_earned_for_completing_goal: number;
  @Field(() => Int)
  hlp_points_earned_for_winning_the_challenge: number;
  @Field(() => Int)
  total_hlp_points_earned_by_performing_tool_kit: number;
  @Field(() => Int)
  total_hlp_reward_points_earned: number;
  status: string;
  created_at: string;
  updated_at: string;
  challenge_id: string;
  id: string;
  user_id: string;
}
