import { Field, ObjectType } from '@nestjs/graphql';
import { Action } from '../entity/action.entity';
import { Toolkit } from '../../toolkits/toolkits.model';
import { Checkin } from '../../checkins/entities/check-ins.entity';
import { MembershipLevel } from '../../membership-levels/entities/membership-level.entity';
import { MembershipStage } from '../../membership-stages/membership-stages.model';
import { Trophy } from '../../trophies/entities/trophy.entity';
import { TrophyWithStatus } from '../../users/dto/get-user-score.dto';

export class Actions extends Action {
  action_trophies: ActionTrophies[];
  action_tool_kits: ActionToolkit[];
  action_levels: ActionMembershipLevel[];
  action_check_ins: ActionCheckins[];
  is_completed: boolean;
  can_claim: boolean;
  has_membership_stage: boolean;
  membership_stage: MembershipStage;
}

export class ActionMembershipLevel {
  membership_level: MembershipLevel;
}

export class ActionTrophies {
  trophy: Trophy;
}

export class ActionToolkit {
  tool_kit: Toolkit;
}

export class ActionCheckins {
  check_in: Checkin;
}

@ObjectType()
export class ToolkitWithStatus extends Toolkit {
  @Field(() => Boolean, { nullable: true })
  is_completed: boolean;
}

@ObjectType()
export class CheckinsWithStatus extends Checkin {
  @Field(() => Boolean, { nullable: true })
  is_completed: boolean;
}

@ObjectType()
export class MembershipLevelCompletionStatus extends MembershipLevel {
  @Field(() => Boolean, { nullable: true })
  is_completed: boolean;
}

@ObjectType()
export class ActionsDto extends Action {
  @Field(() => [MembershipLevelCompletionStatus], { nullable: true })
  membership_levels?: MembershipLevelCompletionStatus[];
  @Field(() => [CheckinsWithStatus], { nullable: true })
  checkins?: CheckinsWithStatus[];
  @Field(() => [ToolkitWithStatus], { nullable: true })
  tool_kits?: ToolkitWithStatus[];
  @Field(() => [TrophyWithStatus], { nullable: true })
  trophies?: TrophyWithStatus[];
  @Field(() => String, { nullable: true })
  membership_stage_title: string;
  @Field(() => String, { nullable: true })
  membership_stage_color_code: string;
  @Field(() => Boolean, { nullable: true })
  is_completed: boolean;
  @Field(() => Boolean, { nullable: true })
  can_claim: boolean;
  @Field(() => Boolean, { nullable: true })
  has_membership_stage: boolean;
}

@ObjectType()
export class GetActionsResponse {
  @Field(() => [ActionsDto], { nullable: true })
  actions: ActionsDto[];
}
