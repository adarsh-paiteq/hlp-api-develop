import { ArgsType, Field, ObjectType, PickType } from '@nestjs/graphql';
import { IsNumber, IsOptional } from 'class-validator';
import { GraphQLInt } from 'graphql';
import { GoalLevel } from '../entities/goal-level.entity';
import { Goal } from '../entities/goal.entity';
import { UserGoalLevel } from '../entities/user-goal-level.entity';

export class GoalLevelWithStatus extends GoalLevel {
  is_completed: boolean;
}

export class GoalWithLevels extends Goal {
  goal_levels: GoalLevelWithStatus[];
  total: number;
}

@ObjectType()
export class GoalLevelDto extends GoalLevelWithStatus {
  @Field()
  progress_percentage: number;

  @Field()
  goal_title: string;

  @Field()
  goal_emoji_image_url: string;

  @Field()
  goal_emoji_image_id: string;

  @Field()
  goal_emoji_image_file_path: string;

  @Field()
  goal_earned_points: number;

  @Field(() => GraphQLInt)
  hlp_reward_points_to_complete_goal: number;
}

@ObjectType()
export class GetGoalLevelsResponse {
  @Field(() => [GoalLevelDto], { nullable: 'items' })
  levels: (GoalLevelDto | undefined)[];
}

@ArgsType()
export class GetGoalLevelsArgs {
  @Field(() => GraphQLInt, { nullable: true })
  @IsOptional()
  @IsNumber()
  limit: number;
}

export class SaveUserGoalLevel extends PickType(UserGoalLevel, [
  'user_id',
  'goal_level_id',
]) {}
