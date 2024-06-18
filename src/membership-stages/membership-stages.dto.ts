import { PickType } from '@nestjs/mapped-types';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { MembershipLevel } from '../membership-levels/membership-levels.dto';
import { UserMembershipStage } from './entities/user-membership-stages.entity';
import { HideField } from '@nestjs/graphql';
import { Translation } from '@utils/utils.dto';

export class MembershipStage {
  account_duration: number;
  hlp_reward_points: number;
  hlp_reward_points_to_unlock_this_stage: number;
  number_of_donations: number;
  sequence_number: number;
  color_code: string;
  description: string;
  emoji: string;
  title: string;
  created_at: string;
  updated_at: string;
  id: string;
  membership_level_id: string;
  emoji_image_url: string;
  emoji_image_file_path: string;
  emoji_image_id: string;
  text_color: string;

  membership_level: MembershipLevel;

  is_completed?: boolean;
  progress_percentage: number;
  check_list: MembershipStageCheck[];
  has_membership_level: boolean;
  @HideField()
  translations?: Translation;
}

export class MembershipStageCheck {
  is_completed: boolean;
  name: string;
}

export class GetNextMembershipStageDto {
  @IsUUID()
  userId: string;

  @IsNumber()
  points: number;

  @IsString()
  @IsOptional()
  lang?: string;
}

export class UserDonationsAggregate {
  aggregate: { count: number };
}

export class SaveUserMembershipStageDto extends PickType(UserMembershipStage, [
  'user_id',
  'membership_stage_id',
]) {}

export class GetMembershipStagesSummaryBodyDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
