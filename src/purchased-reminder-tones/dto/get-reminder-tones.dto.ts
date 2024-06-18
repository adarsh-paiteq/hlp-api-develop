import { Field, ObjectType, PickType } from '@nestjs/graphql';
import { UserMembershipStage } from '../../membership-stages/entities/user-membership-stages.entity';
import { MembershipStage } from '../../membership-stages/membership-stages.model';
import { Users } from '../../users/users.model';
import { ReminderTone } from '../entities/reminder-tone.entity';
import { UserReminderTonePurchase } from '../entities/user-reminder-tone-purchases.entity';

@ObjectType()
export class ReminderToneDto extends ReminderTone {
  @Field(() => Boolean)
  enabled: boolean;
}

@ObjectType()
export class GetReminderTonesResponseDto {
  @Field(() => [ReminderToneDto], { nullable: 'items' })
  reminderTones: ReminderToneDto[];
}

@ObjectType()
export class ReminderTonesAndTonePurchase extends ReminderTone {
  @Field(() => MembershipStage, { nullable: true })
  membership_stages: MembershipStage;
  @Field(() => [UserReminderTonePurchase], { nullable: 'items' })
  user_reminder_tone_purchases: UserReminderTonePurchase[];
}
@ObjectType()
export class GetUsersAndMembershipStage extends PickType(Users, [
  'current_membership_stage_id',
]) {
  @Field(() => MembershipStage, { nullable: true })
  membership_stages: MembershipStage;
  @Field(() => [UserMembershipStage], { nullable: 'items' })
  user_membership_stages: UserMembershipStage[];
}

@ObjectType()
export class GetReminderTonesListResponse {
  @Field(() => GetUsersAndMembershipStage)
  users: GetUsersAndMembershipStage;
  @Field(() => [ReminderTonesAndTonePurchase], { nullable: 'items' })
  reminder_tones: ReminderTonesAndTonePurchase[];
  @Field(() => [String], { nullable: 'items' })
  unlocked_membership_stages: string[];
}
