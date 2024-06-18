import { i18nValidationMessage } from '@core/modules/i18n-next';
import {
  ArgsType,
  Field,
  GraphQLISODateTime,
  HideField,
  ObjectType,
} from '@nestjs/graphql';
import { Translation } from '@utils/utils.dto';
import { IsNotEmpty, IsUUID } from 'class-validator';

@ObjectType()
export class UserRewards {
  id: string;
  reward_type: string;
  membership_level_id?: string;
  membership_stage_id?: string;
  trophy_id?: string;
  hlp_reward_points_awarded: number;
  challenge_id?: string;
  streak_id?: string;
  @Field(() => GraphQLISODateTime)
  created_at: string;
  @Field(() => GraphQLISODateTime)
  updated_at: string;
  user_id: string;
  tool_kit_id?: string;
  goal_id?: string;
  goal_level_id?: string;
  user_donation_id?: string;
  channel_id?: string;
  channel_post_id?: string;
  post_reaction_id?: string;
  title: string;
  checkin_level_id?: string;
  blog_id?: string;
  bonus_id?: string;
  user_mood_check_id?: string;
  form_id?: string;
  user_toolkit_id?: string;
  @HideField()
  translations?: Translation;
}
@ArgsType()
export class AddBlogToolKitRewardArgs {
  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  toolKitId: string;
}

@ObjectType()
export class CommonRespMessage {
  @Field()
  message: string;
}
