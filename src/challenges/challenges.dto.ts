import { IsDateString, IsUUID } from 'class-validator';
import { MembershipLevel } from '../membership-levels/membership-levels.dto';
import { ToolKit } from '../rewards/rewards.dto';
import { Schedule } from '../schedules/schedules.dto';
import { UserDto } from '../users/users.dto';
import { Channel } from '../channels/entities/channel.entity';

export class ClaimRewardParamDto {
  @IsUUID()
  id: string;

  @IsUUID()
  userId: string;
}

export class ClaimActionsResponseDto {
  challenge: unknown;
  membership_level: MembershipLevel;
  targetType: string;
  targetTotal: number;
  completed: number;
}

export class Challenge {
  is_challenge_completed: boolean;
  challenge_end_date: string;
  challenge_start_date: string;
  hlp_reward_points_required_for_completing_goal: number;
  hlp_reward_points_required_for_winning_challenge: number;
  hlp_reward_points_to_be_awarded_for_completing_goal: number;
  hlp_reward_points_to_be_awarded_for_winning_challenge: number;
  total_days: number;
  description: string;
  emoji: string;
  file_path: string;
  image_id: string;
  image_url: string;
  label: string;
  short_description: string;
  title: string;
  created_at: string;
  updated_at: string;
  id: string;
  tool_kit_id: string;
  tool_kit: ToolKit;
}
export class UserChallenges {
  id: string;
  challenge_id: string;
  user_id: string;
  hlp_points_earned_for_completing_goal: number;
  hlp_points_earned_for_winning_the_challenge: number;
  total_hlp_points_earned_by_performing_tool_kit: number;
  total_hlp_reward_points_earned: number;
  status: string;
  is_goal_completed: boolean;
  is_winner: boolean;
  created_at: string;
  updated_at: string;
}

export class GetResultParamDto {
  @IsUUID()
  id: string;
}

export class GetResultBodyDto {
  @IsDateString({})
  date: string;

  @IsUUID()
  userId: string;
}

export class GetResultResponseDto {
  challenge_title: string;
  challenge_gif?: string;
  hlp_points: number;
  total_hlp_points: number;
  level: number;
  targetType: string;
  targetTotal: number;
  completed: number;
  ranking: number;
  is_completed: boolean;
  default_channel: Channel;
}

export type GetChallengeAndSchedule = {
  challenge: Challenge;
  user: UserDto;
  schedule: Schedule;
};

export enum TargetType {
  WEEKLY = 'Weekly Target',
  DAILY = 'Daily Target',
}

export enum ChallengeStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  WINNER = 'WINNER',
}

export class UpdateUserChallenge {
  hlp_points_earned_for_completing_goal: number;
  hlp_points_earned_for_winning_the_challenge: number;
  total_hlp_points_earned_by_performing_tool_kit: number;
  total_hlp_reward_points_earned?: number;
  status: string;
  is_winner: boolean;
  is_goal_completed: boolean;
}
