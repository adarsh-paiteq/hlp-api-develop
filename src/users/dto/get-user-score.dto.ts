import { Field, Int, ObjectType } from '@nestjs/graphql';
import { MembershipStage } from '../../membership-stages/membership-stages.model';
import { MembershipLevel } from '../../membership-levels/entities/membership-level.entity';
import { Trophy } from '../../trophies/entities/trophy.entity';

@ObjectType()
export class UserBalance {
  @Field(() => Int, { nullable: true })
  earned: number;
  @Field(() => Int, { nullable: true })
  received: number;
  @Field(() => Int, { nullable: true })
  total: number;
}

@ObjectType()
export class MembershipLevelWithStatus extends MembershipLevel {
  @Field(() => Boolean, { nullable: true })
  is_completed: boolean;
  @Field(() => Int, { nullable: true })
  progress_percentage: number;
  @Field(() => Int, { nullable: true })
  current_hlp_reward_points: number;
  @Field(() => [MembershipLevelUnlockedItem], { nullable: true })
  unlocked_items: MembershipLevelUnlockedItem[];
}
@ObjectType()
export class MembershipLevelUnlockedItem {
  @Field(() => String, { nullable: true })
  name: string;
  @Field(() => Boolean, { nullable: true })
  is_unlocked: boolean;
  @Field(() => Int, { nullable: true })
  value: number;
}
@ObjectType()
export class MembershipStageWithStatus extends MembershipStage {
  @Field(() => Boolean, { nullable: true })
  is_completed?: boolean;
  @Field(() => Int, { nullable: true })
  progress_percentage: number;
  @Field(() => [MembershipStageCheck], { nullable: true })
  check_list: MembershipStageCheck[];
  @Field(() => Boolean, { nullable: true })
  has_membership_level: boolean;
}

@ObjectType()
export class MembershipStageCheck {
  @Field(() => Boolean, { nullable: true })
  is_completed: boolean;
  @Field(() => String, { nullable: true })
  name: string;
}
@ObjectType()
export class TrophyWithStatus extends Trophy {
  @Field(() => Boolean, { nullable: true })
  is_completed: boolean;
}

@ObjectType()
export class GetUserScoreResponse {
  @Field(() => UserBalance, { nullable: true })
  my_balance: UserBalance;
  @Field(() => [MembershipStageWithStatus], { nullable: true })
  membership_stages: MembershipStageWithStatus[];
  @Field(() => [MembershipLevelWithStatus], { nullable: true })
  membership_levels: MembershipLevelWithStatus[];
  @Field(() => [TrophyWithStatus], { nullable: true })
  trophies: TrophyWithStatus[];
  @Field(() => Int)
  bonuses: number;
}
