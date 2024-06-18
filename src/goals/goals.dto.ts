import { IsNumberString, IsOptional } from 'class-validator';
import { ScheduleSessionDto } from '../schedule-sessions/schedule-sessions.dto';
import { ToolKitByToolKit } from '../schedules/schedules.dto';
import { HideField } from '@nestjs/graphql';
import { Translation } from '@utils/utils.dto';

export class GoalLevel {
  id: string;
  short_description: string;
  user_goal_levels: UserGoalLevel[];
  hlp_reward_points_to_complete_goal: number;
  hlp_reward_points_to_be_awarded: number;
  sequence_number: number;
  title: string;
  goal?: Goal;
  color: string;

  // custom
  is_completed: boolean;
  progress_percentage: number;
  goal_title: string;
  goal_avatar: string;
  @HideField()
  translations?: Translation;
}

export class UserGoalLevel {
  id?: string;
  user_id: string;
  goal_level_id: string;
  created_at?: string;
  updated_at?: string;
}

class UserScheduleSessionsAggregate {
  aggregate: { count: number };
}

export class GoalToolKit extends ToolKitByToolKit {
  user_schedule_sessions_aggregate: UserScheduleSessionsAggregate;
  user_schedule_sessions: ScheduleSessionDto[];
}

export class Goal {
  id: string;
  avatar: string;
  title: string;
  emoji_image_url: string;
  emoji_image_id: string;
  emoji_image_file_path: string;
  goal_levels: GoalLevel[];
  tool_kits: GoalToolKit[];
}

export class UserGoal {
  goalByGoal: Goal;
}

/**
 *@deprecated its's migrated to getGoalLevels,Dto's Used in @function getLevels() that are in goals conroller and 
 @function getLevels() that are in goals service.
 */
export class GetLevelsResponse {
  data: (GoalLevel | undefined)[];
}

export class GetHistoryResponse {
  history: GoalHistoryDto[];
}

/**
 *@description its's migrated to getUserGoalHistory,Dto's Used in @function getGoalHistory() that are in goals conroller  but app side used getGoalsHistory action and 
 @function getHistory() that are in goals service.
 and @function getGoalsHistory() and @function getPagination() that are in goals repository.
 */
export class GetHistoryQuery {
  @IsNumberString()
  page: number;

  @IsOptional()
  @IsNumberString()
  limit: number;
}

export class GoalHistoryDto {
  title: string;
  date: string;
  total: number;
  completed: number;
  time: string;

  schedule_id?: string;
}

export type GroupSessionsByDate = Array<{
  date: string;
  sessions: ScheduleSessionDto[];
}>;

export class CheckGoalLevel {
  tool_kit_id: string;
  user_id: string;
}
export class GoalByTookKit {
  goal_id: string;
}

export class CheckGoalLevelResponse {
  message: string;
  completedLevel?: GoalLevel;
  nextLevel?: GoalLevel;
  alreadyCompletedGoalLevels: GoalLevel[];
}

export class UserGoalDto {
  user_id: string;
  goal: string;
  is_selected: boolean;
}
