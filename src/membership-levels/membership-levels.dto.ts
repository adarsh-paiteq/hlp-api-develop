import { HideField } from '@nestjs/graphql';
import { PickType } from '@nestjs/mapped-types';
import { Translation } from '@utils/utils.dto';
import { IsNumber, IsUUID } from 'class-validator';

export class MembershipLevel {
  hlp_reward_points: number;
  hlp_reward_points_to_complete_this_level: number;
  sequence_number: number;
  title: string;
  created_at: string;
  updated_at: string;
  id: string;
  description?: string;

  // custom
  is_completed: boolean;
  progress_percentage: number;
  unlocked_items: MembershipLevelUnlockedItem[];
  current_hlp_reward_points: number;
  @HideField()
  translations?: Translation;
}

export class MembershipLevelUnlockedItem {
  name: string;
  is_unlocked: boolean;
  value: number;
}

export class UserMembershipLevel {
  id: string;
  user_id: string;
  membership_level_id: string;
  is_level_completed_by_user: boolean;
  created_at: string;
  updated_at: string;
}

export class SaveUserMembershipLevel extends PickType(UserMembershipLevel, [
  'user_id',
  'membership_level_id',
  'is_level_completed_by_user',
]) {}

/**
 * @description The @function getNextMembershipLevelTest()  functions in the membership-levels controller and The @function checkMembershipLevel() in the membership-levels services utilizes DTOs
 */
export class CheckMembershipLevelDto {
  @IsUUID()
  userId: string;

  @IsNumber()
  points: number;

  lang?: string;
}
