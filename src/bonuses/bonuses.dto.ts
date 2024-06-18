import { IsNotEmpty, IsUUID } from 'class-validator';
import { MembershipStage } from '../membership-stages/membership-stages.dto';
import { UserMembershipStage } from '../membership-stages/entities/user-membership-stages.entity';
import { UserDto } from '../users/users.dto';
import { HideField } from '@nestjs/graphql';
import { Translation } from '@utils/utils.dto';

export class Bonus {
  hlp_reward_points: number;
  number_of_check_ins_to_be_completed: number;
  number_of_tools_to_be_completed: number;
  number_of_trophies_to_be_earned: number;
  bonus_type: BonusType;
  emoji: string;
  short_description: string;
  title: string;
  created_at: string;
  updated_at: string;
  id: string;
  membership_stage_id: string;
  user_bonus_claimeds: UserBonus[];

  membership_stage: MembershipStage;

  // custom
  is_claimed: boolean;
  can_claim: boolean;
  progress_percentage: number;
  user_id: string;
  total: number;
  has_membership_stage: boolean;
  @HideField()
  translations?: Translation;
}

export enum BonusType {
  TROPHY = 'TROPHY',
  CHECK_IN = 'CHECK_IN',
  TOOL_KIT = 'TOOL_KIT',
}

export class UserBonus {
  id: string;
  user_id: string;
  bonus_id: string;
  created_at: string;
  updated_at: string;
}

export class BonusTypeAggregate {
  aggregate: { count: number };
}

export class GetBonuses {
  bonuses: Bonus[];
  user: UserDto;
  toolkits: BonusTypeAggregate;
  checkins: BonusTypeAggregate;
  trophies: BonusTypeAggregate;
  membership_stages: UserMembershipStage[];
}

export class GetBonusesParamDto {
  @IsUUID()
  id: string;
}

export class GetBonusesResponse {
  bonuses: Bonus[];
}

export class ClaimBonusParamDto {
  @IsUUID()
  id: string;
}

export class ClaimBonusResponseDto extends UserBonus {}

export class GetCheckinBonusResponse {
  message: string;
  data?: Bonus;
}

export class GetCheckinBonusQuery {
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}

export class GetToolkitBonuseResponse extends GetCheckinBonusResponse {}
export class GetTrophyBonusResponse extends GetCheckinBonusResponse {}
export class GetToolkitBonusQuery extends GetCheckinBonusQuery {}
export class GetTrophyBonuseQuery extends GetCheckinBonusQuery {}
