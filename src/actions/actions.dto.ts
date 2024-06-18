import { OmitType } from '@nestjs/mapped-types';
import { IsUUID } from 'class-validator';
import { MembershipLevel } from '../membership-levels/membership-levels.dto';
import { MembershipStage } from '../membership-stages/membership-stages.dto';
import { ToolKit } from '../rewards/rewards.dto';
import { CheckInByCheckIn } from '../schedules/schedules.dto';
import { Trophy } from '../trophies/trophies.dto';

export class Action {
  action_type: string;
  description: string;
  file_path: string;
  image_id: string;
  image_url: string;
  link_url: string;
  short_description: string;
  sub_title: string;
  title: string;
  created_at: string;
  updated_at: string;
  id: string;
  membership_stage_id: string;

  action_trophies: ActionTrophiesConstraint[];
  action_tool_kits: ActionToolkitConstraint[];
  action_levels: ActionMembershipLevelConstraint[];
  action_check_ins: ActionCheckinsConstraint[];

  is_completed: boolean;
  can_claim: boolean;
  has_membership_stage: boolean;

  membership_stage: MembershipStage;
}

export class ActionDto extends OmitType(Action, [
  'action_check_ins',
  'action_levels',
  'action_tool_kits',
  'action_trophies',
  'membership_stage',
]) {
  membership_levels?: MembershipLevel[];
  checkins?: CheckInByCheckIn[];
  tool_kits?: ToolKit[];
  trophies?: Trophy[];
  membership_stage_title: string;
  membership_stage_color_code: string;
}

export class ActionMembershipLevelConstraint {
  membership_level: MembershipLevel;
}

export class ActionTrophiesConstraint {
  trophy: Trophy;
}

export class ActionToolkitConstraint {
  tool_kit: ToolKit;
}

export class ActionCheckinsConstraint {
  check_in: CheckInByCheckIn;
}

export enum ActionType {
  LEVEL = 'LEVEL',
  CHECK_IN = 'CHECK_IN',
  TOOL_KIT = 'TOOL_KIT',
  TROPHIES = 'TROPHIES',
}

export class UserAction {
  id: string;
  user_id: string;
  action_id: string;
  created_at: string;
  updated_at: string;
  voucher_code: string;
}

export class UserActionDto {
  user_id: string;
  action_id: string;
  voucher_code: string;
}

export class GetActionsParams {
  @IsUUID()
  id: string;
}

export class UserCheckin {
  id: string;
  check_in: string;
  user_id: string;
}

export class GetActionsResponseDto {
  actions: ActionDto[];
}

export class ClaimActionsParamsDto {
  @IsUUID()
  id: string;
}
export class ClaimActionsResponseDto {
  data: any;
}
