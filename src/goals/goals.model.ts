import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field, HideField, ObjectType } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';
import { Translation } from '@utils/utils.dto';

@ArgsType()
export class UpdateUserGoalsArgs {
  @Field(() => [String], { description: 'Goal ids', nullable: 'items' })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid'), each: true })
  goals: string[];
}

@ObjectType()
export class UpdateUserGoalsResponse {
  affectedRows: number;
}

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
}

@ObjectType()
export class Goal {
  age_group?: string[];
  avatar?: string;
  description?: string;
  emoji_image_file_path?: string;
  emoji_image_id?: string;
  emoji_image_url?: string;
  goal_info?: string;
  title?: string;
  created_at: string;
  updated_at: string;
  id: string;
  @HideField()
  translations?: Translation;
  is_default?: boolean;
}

@ObjectType()
export class UserGoal {
  created_at: string;
  updated_at: string;
  goal: string;
  id: string;
  user_id: string;
  is_selected: boolean;
}

@ObjectType()
export class GolaWithUserGoal extends Goal {
  @Field(() => [UserGoal], { nullable: 'items' })
  user_goals: UserGoal[];
}

@ObjectType()
export class GetGoalsByAgeGroupResponse {
  @Field(() => [GolaWithUserGoal], { nullable: 'items' })
  goals: GolaWithUserGoal[];
}

export class UserGoalLevels extends GoalLevel {
  is_completed: boolean;
  goal_title: string;
  is_goal_selected?: boolean;
}
