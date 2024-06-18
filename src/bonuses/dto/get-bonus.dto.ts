import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Bonuses } from '../entities/bonus.entity';
import { MembershipStage } from '../../membership-stages/membership-stages.model';

@ObjectType()
export class GetBonusesWithMembership extends Bonuses {
  @Field(() => MembershipStage, { nullable: true })
  membership_stage: MembershipStage;
  @Field(() => Boolean, { nullable: true })
  is_claimed: boolean;
  @Field(() => Boolean, { nullable: true })
  can_claim: boolean;
  @Field(() => Int, { nullable: true })
  progress_percentage: number;
  @Field(() => Int, { nullable: true })
  total: number;
  @Field(() => Boolean, { nullable: true })
  has_membership_stage: boolean;
}

@ObjectType()
export class GetBonusesResponse {
  @Field(() => [GetBonusesWithMembership], { nullable: 'items' })
  bonuses: GetBonusesWithMembership[];
}
