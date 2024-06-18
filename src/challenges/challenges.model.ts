import { i18nValidationMessage } from '@core/modules/i18n-next';
import {
  ArgsType,
  Field,
  GraphQLISODateTime,
  HideField,
  InputType,
  Int,
  ObjectType,
} from '@nestjs/graphql';
import { Translation } from '@utils/utils.dto';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { GraphQLInt } from 'graphql';

@ObjectType()
export class Challenge {
  is_challenge_completed: boolean;
  @Field(() => GraphQLISODateTime)
  challenge_end_date: string;
  @Field(() => GraphQLISODateTime)
  challenge_start_date: string;
  @Field(() => Int)
  hlp_reward_points_required_for_completing_goal: number;
  @Field(() => Int)
  hlp_reward_points_required_for_winning_challenge: number;
  @Field(() => Int)
  hlp_reward_points_to_be_awarded_for_completing_goal: number;
  @Field(() => Int)
  hlp_reward_points_to_be_awarded_for_winning_challenge: number;
  @Field(() => Int)
  total_days: number;
  description: string;
  emoji: string;
  extra_information_description?: string;
  extra_information_title?: string;
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
  @HideField()
  translations?: Translation;
}

@ObjectType()
export class ChallengeRankingResponse {
  title: string;

  challenge_end_date: string;

  is_challenge_completed: boolean;

  @Field(() => GraphQLInt)
  hlp_reward_points_required_for_completing_goal: number;

  @Field(() => GraphQLInt)
  hlp_reward_points_required_for_winning_challenge: number;

  @Field(() => GraphQLInt)
  total_days: number;

  user_rankings: Array<UserRanking>;

  @Field(() => GraphQLInt)
  days_passed: number;

  challenge_points_claimed: boolean;

  @Field(() => GraphQLInt)
  user_ranking: number;
}

@ObjectType()
export class UserRanking {
  @Field(() => GraphQLInt)
  id: number;

  avatar?: string;

  user_id: string;

  user_name: string;

  full_name: string;

  avatar_image_name?: string;

  @Field(() => GraphQLInt)
  hlp_points_earned: number;
}

@ArgsType()
export class GetRankingArgs {
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  id: string;

  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  date: string;
}

@InputType()
export class AddChallengeArgs extends Challenge {
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  tool_kit_id: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  title: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  label: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  emoji: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  short_description: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  description: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  image_id: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  image_url: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  file_path: string;

  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  challenge_start_date: string;

  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  challenge_end_date: string;

  @Field(() => Int)
  @IsNumber({}, { message: i18nValidationMessage('is_number') })
  total_days: number;

  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  is_challenge_completed: boolean;

  @Field(() => Int)
  @IsNumber({}, { message: i18nValidationMessage('is_number') })
  hlp_reward_points_required_for_completing_goal: number;

  @Field(() => Int)
  @IsNumber({}, { message: i18nValidationMessage('is_number') })
  hlp_reward_points_required_for_winning_challenge: number;

  @Field(() => Int)
  @IsNumber({}, { message: i18nValidationMessage('is_number') })
  hlp_reward_points_to_be_awarded_for_completing_goal: number;

  @Field(() => Int)
  @IsNumber({}, { message: i18nValidationMessage('is_number') })
  hlp_reward_points_to_be_awarded_for_winning_challenge: number;

  @Field({ nullable: true })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  extra_information_title: string;

  @Field({ nullable: true })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  extra_information_description: string;
}

@InputType()
export class UpdateChallengeArgs {
  @Field({ nullable: true })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  tool_kit_id: string;

  @Field({ nullable: true })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsString({ message: i18nValidationMessage('is_string') })
  title: string;

  @Field({ nullable: true })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsString({ message: i18nValidationMessage('is_string') })
  label: string;

  @Field({ nullable: true })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  emoji: string;

  @Field({ nullable: true })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  short_description: string;

  @Field({ nullable: true })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  description: string;

  @Field({ nullable: true })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  image_id: string;

  @Field({ nullable: true })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  image_url: string;

  @Field({ nullable: true })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  file_path: string;

  @Field({ nullable: true })
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  challenge_start_date: string;

  @Field({ nullable: true })
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  challenge_end_date: string;

  @Field(() => Int, { nullable: true })
  @IsNumber({}, { message: i18nValidationMessage('is_number') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  total_days: number;

  @Field({ nullable: true })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  is_challenge_completed: boolean;

  @Field(() => Int, { nullable: true })
  @IsNumber({}, { message: i18nValidationMessage('is_number') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  hlp_reward_points_required_for_completing_goal: number;

  @Field(() => Int, { nullable: true })
  @IsNumber({}, { message: i18nValidationMessage('is_number') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  hlp_reward_points_required_for_winning_challenge: number;

  @Field(() => Int, { nullable: true })
  @IsNumber({}, { message: i18nValidationMessage('is_number') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  hlp_reward_points_to_be_awarded_for_completing_goal: number;

  @Field(() => Int, { nullable: true })
  @IsNumber({}, { message: i18nValidationMessage('is_number') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  hlp_reward_points_to_be_awarded_for_winning_challenge: number;

  @Field({ nullable: true })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  extra_information_title: string;

  @Field({ nullable: true })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  extra_information_description: string;
}

@ObjectType()
export class ChallengeResponse extends Challenge {
  is_user_joined_challenge: boolean;
}

@ObjectType()
export class IsChallengePointsClaimedResponse {
  challenge_points_claimed: boolean;
}

@ArgsType()
export class IsChallengePointsClaimedArgs {
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  challengeId: string;
}
