import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';
import { PartialType, PickType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  Allow,
  IsDateString,
  IsEmail,
  IsEnum,
  IsJWT,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

import { MembershipLevel } from '../membership-levels/membership-levels.dto';
import { UserMembershipStage } from '../membership-stages/entities/user-membership-stages.entity';
import { UserBalance } from '../rewards/rewards.dto';
import { ToolKitByToolKit } from '../schedules/schedules.dto';
import { ToolkitStreak } from '../streaks/streaks.dto';
import { ShopItem } from './entities/shop-item.entity';
import { AvatarType } from './users.model';

export enum UserRoles {
  USER = 'user',
  ADMIN = 'admin',
  CONTENT_EDITOR = 'content_editor',
  DOCTOR = 'doctor',
}

export enum AgeGroups {
  child = 'child',
  adult = 'adult',
  elder = 'elder',
}
export class UserDto {
  id: string;
  full_name: string;
  user_name: string;
  email: string;
  password: string;
  salt: string;
  puk_reference_id: string;
  age_group: string;
  app_access_pin: string;
  app_lock_enabled: boolean;
  accepted_terms_and_conditions: boolean;
  avatar: string;
  role: string;
  last_login_time: Date;
  created_at: string;
  updated_at: string;
  refresh_token: string | null;
  forgot_password_token: string | null;
  forgot_pin_token: string | null;
  email_verification_token: string | null;
  hlp_reward_points_balance: number;
  current_membership_stage_id: string;
  current_membership_level_id: string;
  membership_level: MembershipLevel;
  email_verification_code?: string | null;
  is_deleted?: boolean | null;
  is_onboarded?: boolean | null;
  organization_id?: string | null;
  avatar_image_name?: string | null;
  image_url?: string | null;
  image_id?: string | null;
  file_path?: string | null;
  avatar_type: AvatarType;
}

export class UserSignupDto extends PartialType(UserDto) {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsString()
  @Allow()
  role: string = UserRoles.USER;

  @IsString()
  @IsNotEmpty()
  puk_reference_id: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(AgeGroups)
  age_group: string;

  @Allow()
  accepted_terms_and_conditions = true;

  @Allow()
  last_login_time = new Date();

  @Allow()
  is_test_puk: boolean;
}

export class AdminSignupDto extends PartialType(UserDto) {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @Allow()
  role: string = UserRoles.ADMIN;

  @Allow()
  last_login_time = new Date();

  @Allow()
  accepted_terms_and_conditions = true;

  @IsString()
  @IsNotEmpty()
  full_name: string;
}

export class User extends UserSignupDto {}

export class UserUpdateDto extends PartialType(UserDto) {}

/**
 *@deprecated  This DTO used in update_token action , which is not used from app side(in app side they are using refreshToken resolver name)
 */
export class RefreshTokenDto {
  @IsJWT()
  token: string;
}

export class LoginDto {
  @IsString()
  @IsEmail({}, { message: `invalidEmail` })
  email: string;

  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  @IsEnum(UserRoles)
  role: string;
}

export class CheckEmailDto {
  @IsString()
  @IsEmail()
  email: string;

  @Allow()
  role: string = UserRoles.USER;
}

/**
 *@deprecated This DTO used in update_user_name action , which is not used from app side(in app side they are using updateScreenName resolver name)
 */
export class UpdateUserNameDto {
  @IsString()
  @IsNotEmpty()
  user_name: string;

  @Allow()
  role: string = UserRoles.USER;
}

/**
 *@deprecated This DTO used in change_password action,which is not used from app side(in app side they are using changePassword resolver name)
 */
export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}

export class ChangePasswordParamsDto {
  @IsString()
  @IsUUID()
  id: string;
}

export class ChangePasswordQueryDto {
  @IsJWT()
  @IsNotEmpty()
  token: string;
}

export class ForgotPasswordDto extends CheckEmailDto {}

export class SendVerificationEmailDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

/**
 *@deprecated This DTO are used in forgot_pin action,which is not used from app side(in app side they are using sendForgotPinEmail)
 */
export class ForgotPINDto extends SendVerificationEmailDto {}

export class ChangePINDto {
  @IsNumberString()
  @IsNotEmpty()
  @MaxLength(4)
  @MinLength(4)
  pin: string;
}

export class ChangePINParamsDto extends ChangePasswordParamsDto {}

/**
 *@deprecated This DTO are used in change_pin action,which is not used from app side(in app side they are using changePin)
 */
export class ChangePINQueryDto extends ChangePasswordQueryDto {}

/**
 *@deprecated This DTO are used in verify_email action,which is not used from app side(in app side they are using changePassword)
 */
export class VerifyEmailParamsDto extends ChangePasswordParamsDto {}

/**
 *@deprecated This DTO are used in verify_email action,which is not used from app side(in app side they are using verifyEmail)
 */
export class VerifyEmailQueryDto extends ChangePasswordQueryDto {}

/**
 *@deprecated This DTO are used in send_verification_email action,which is not used from app side(in app side they are using sendVerificationEmail)
 */
export class SendVerificationEmailParamsDto extends ChangePasswordParamsDto {}

/**
 *@deprecated  This DTO are used in add_pin action,which is not used from app side(in app side they are using addPin)
 */
export class AddPinParamsDto extends ChangePINParamsDto {}

/**
 *@deprecated This DTO are used in add_pin action,which is not used from app side(in app side they are using addPin)
 */
export class AddPinDto extends ChangePINDto {}

/**
 *@deprecated  This DTO are used in check_pin action,which is not used from app side(in app side they are using checkPin)
 */
export class CheckPinParamsDto extends ChangePINParamsDto {}

/**
 *@deprecated This DTO are used in check_pin action,which is not used from app side(in app side they are using checkPin)
 */
export class CheckPinDto extends ChangePINDto {}

/**
 * @deprecated dto are used in getToolKitHistory action, which is not used from app side(in app side they are using GetToolkitAnswersHistory resolver name)
 */
export enum ToolKitTypes {
  DRINK_WATER = 'DRINK_WATER',
  RUNNING = 'RUNNING',
  VIDEO = 'VIDEO',
  ACTIVITY = 'ACTIVITY',
  MEDITATION = 'MEDITATION',
  PODCAST = 'PODCAST',
  SLEEP_CHECK = 'SLEEP_CHECK',
  STEPS = 'STEPS',
  HEART_RATE = 'HEART_RATE',
  BLOOD_PRESSURE = 'BLOOD_PRESSURE',
  WEIGHT = 'WEIGHT',
  MEDICATION = 'MEDICATION',
  ECG = 'ECG',
  FORM = 'FORM',
  EPISODES = 'EPISODES',
  HABIT = 'HABIT',
  ALCOHOL_INTAKE = 'ALCOHOL_INTAKE',
  SPORT = 'SPORT',
}

/**
 * @deprecated dto are used in getToolKitHistory action, which is not used from app side(in app side they are using GetToolkitAnswersHistory resolver name)
 */
export enum ToolKitTypesAnswerTables {
  DRINK_WATER = 'drink_water_tool_kit_answers',
  RUNNING = 'running_tool_kit_answers',
  VIDEO = 'video_tool_kit_answers',
  ACTIVITY = 'activity_tool_kit_answers',
  MEDITATION = 'meditation_tool_kit_answers',
  PODCAST = 'podcast_tool_kit_answers',
  SLEEP_CHECK = 'sleep_check_tool_kit_answers',
  STEPS = 'steps_tool_kit_answers',
  HEART_RATE = 'heart_rate_tool_kit_answers',
  BLOOD_PRESSURE = 'blood_pressure_tool_kit_answers',
  WEIGHT = 'weight_intake_tool_kit_answers',
  MEDICATION = 'medication_tool_kit_answers',
  ECG = 'ecg_tool_kit_answers',
  FORM = 'user_form_answers',
  EPISODES = 'episode_form_answers',
  HABIT = 'habit_tool_kit_tools_answers',
  ALCOHOL_INTAKE = 'alcohol_intake_tool_kit_answers',
  SPORT = 'sports_tool_kit_answers',
}

export interface ToolKitHistory {
  alcohol_intake_tool_kit_history?: Array<AlcoholIntakeAnswersInfo>;
  hlp_reward_points_earned: number;
}

export interface AlcoholIntakeAnswersInfo {
  id: string;
  user_id: string;
  tool_kit_id: string;
  doses: number;
  feeling: number;
  note: string;
  created_at: string;
  session_date: string;
  alchohol_type: AlcoholType;
  schedule_id: string;
  hlp_points_earned: number;
  session_id: string;
}

export interface AlcoholType {
  id: string;
  title: string;
}

export class GetDashboardQueryDto {
  @IsDateString({ strict: true })
  date: string;
}

export class GetDashboardTestQueryDto extends GetDashboardQueryDto {
  @IsUUID()
  userId: string;
}

/**
 * @deprecated dto are used in getToolKitHistory action, which is not used from app side(in app side they are using GetToolkitAnswersHistory resolver name)
 */
export class ToolKitHistoryDTO {
  @IsEnum(ToolKitTypes, { message: 'Enter a valid tool kit type' })
  @IsNotEmpty({ message: 'Tool kit type is required' })
  tool_kit_type: string;

  @IsOptional()
  date: string;

  @IsUUID()
  @IsNotEmpty()
  user_id: string;

  @IsOptional()
  tool_kit_id: string;
}

/**
 * @deprecated dto are used in getToolKitHistory action, which is not used from app side(in app side they are using GetToolkitAnswersHistory resolver name)
 */
export const HISTORY_PAGE_FIELD_NAMES_FOR_EACH_TOOL_KIT = {
  DRINK_WATER: 'drink_water_tool_kit_answers',
  RUNNING: 'running_tool_kit_answers',
  VIDEO: 'video_tool_kit_answers',
  ACTIVITY: 'activity_time',
  MEDITATION: 'meditation_time',
  PODCAST: 'podcast_tool_kit_answers',
  SLEEP_CHECK: 'total_sleep_time',
  STEPS: 'steps',
  HEART_RATE: 'lowest_heart_rate,highest_heart_rate',
  BLOOD_PRESSURE: 'highest_bp',
  WEIGHT: 'weight',
  MEDICATION: 'name,doses',
  ECG: 'spm',
  FORM: 'form.title',
  EPISODES: 'form.title',
  HABIT: 'habit_tool_kit_tools_answers',
  ALCOHOL_INTAKE: 'doses',
  SPORT: 'duration',
};

/**
 * @deprecated dto are used in getToolKitHistory action, which is not used from app side(in app side they are using GetToolkitAnswersHistory resolver name)
 */
export interface ToolKitHistoryResponse {
  history: Array<ToolKitAnswerHistory>;
  hlp_reward_points_earned: number;
  streaks: Array<ToolkitStreak>;
}

export interface ToolKitAnswerHistory {
  emoji: string;
  answer: string;
  session_date: Date;
}

export class CampaignQueryDTO {
  @IsUUID()
  id: string;

  @IsUUID()
  user_id: string;

  @IsUUID()
  campaign_id: string;

  @IsNumber()
  @Type(() => Number)
  hlp_reward_points_donated: number;

  @IsDateString()
  updated_at: Date;

  @IsDateString()
  created_at: Date;
}

export class CampaignDto {
  @ValidateNested()
  @Type(() => CampaignQueryDTO)
  data: CampaignQueryDTO;
}

/**
 * @description schedules event trigger are used
 */
export class UserScheduleDTO {
  @IsUUID()
  user: string;

  @IsUUID()
  @IsOptional()
  challenge_id: string;
}

export interface CampaignInfoResponse {
  campaign_by_pk: CampaignInfo;
}

export interface CampaignListResponse {
  campaign: Array<CampaignInfo>;
}

export interface CampaignInfo {
  id: string;
  title: string;
  short_description: string;
  image_url: string;
  image_id: string;
  file_path: string;
  campaign_goal: number;
  is_campaign_goal_fulfilled: boolean;
  campaign_donations_aggregate: CampaignDonationsAggregate;
}

export interface CampaignList {
  id: string;
  title: string;
  short_description: string;
  image_url: string;
  image_id: string;
  file_path: string;
  campaign_goal: number;
  is_campaign_goal_fulfilled: boolean;
  total_hlp_points_donated: number;
}

export interface CampaignDonationsAggregate {
  aggregate: CampaignDonationSumAggregate;
}

export interface CampaignDonationSumAggregate {
  sum: {
    hlp_reward_points_donated: number;
  };
}

export interface CampaignListModel {
  campaigns: Array<CampaignList>;
  previous_campaigns: Array<CampaignList>;
}

/**
 *@description dto are used in get-challenge-ranking controller action,unable to find action and event
 */
export class ChallengesRankingQueryDTO {
  @IsUUID()
  @IsNotEmpty()
  challenge_id: string;

  @IsDateString()
  @IsNotEmpty()
  current_date: Date;
}

/**
 *@description dto are used in get-challenge-ranking controller action,unable to find  action and event
 */
export interface ChallengeDetails {
  id: string;
  title: string;
  challenge_start_date: Date;
  challenge_end_date: Date;
  is_challenge_completed: boolean;
  hlp_reward_points_required_for_completing_goal: number;
  hlp_reward_points_required_for_winning_challenge: number;
  total_days: number;
  tool_kit: ToolKitByToolKit;
}

export interface UserChallengesInfo {
  id: string;
  user_id: string;
  challenge_id: string;
  user: UserInfo;
}

export interface UserInfo {
  id: string;
  user_name: string;
  full_name: string;
  avatar: string;
  table_name: ToolKitAnswerAggregate;
}

export interface ToolKitAnswerAggregate {
  sum: HLPPointsAggregate;
}

export interface HLPPointsAggregate {
  hlp_points_earned: number;
}

export interface ChallengeRankingResponse {
  title: string;
  challenge_end_date: Date;
  is_challenge_completed: boolean;
  hlp_reward_points_required_for_completing_goal: number;
  hlp_reward_points_required_for_winning_challenge: number;
  total_days: number;
  user_rankings: Array<UserRankings>;
  days_passed: number;
}

export interface UserRankings {
  id: number;
  avatar: string;
  user_id: string;
  user_name: string;
  full_name: string;
  hlp_points_earned: number;
}

export class ShopItemPriceAndHLPPointsDTO {
  @IsUUID()
  @IsNotEmpty()
  shop_item_id: string;

  @IsUUID()
  @IsNotEmpty()
  user_id: string;
}

export interface ShopItemPrices {
  hlp_reward_points_required: number;
  item_price: number;
}
export class ShopItemPriceAndHLPPointsResponse {
  hlp_points: number | null;
  message?: string;
  item_price: number;
  shipping_cost: number;
}
export class GetUserScoreParamDto {
  @IsUUID()
  id: string;
}

export class GetUserScoreResponseDto {
  my_balance: UserBalance;
  membership_stages: unknown[];
  membership_levels: unknown[];
  trophies: unknown[];
  bonuses: number;
}

/**
 * @deprecated Action name is GetToolKitByUserGoalsAndToolKitCategory, which is not used from app side(in app side they are using gettoolkitCategory resolver name)
 */
export class ToolKitByUserGoalsAndToolKitCategoryDTO {
  @IsUUID()
  @IsNotEmpty()
  tool_kit_category_id: string;
}

export class HabitToolEndDateDTO {
  @IsUUID()
  @IsNotEmpty()
  tool_kit_id: string;

  @IsDateString()
  @IsNotEmpty()
  current_date: Date;
}

/**
 * @deprecated Action name is GetToolKitByUserGoalsAndToolKitCategory, which is not used from app side(in app side they are using gettoolkitCategory resolver name)
 */
export interface UserGoals {
  id: string;
  user: string;
  goal: string;
}

/**
 * @deprecated Action name is GetToolKitByUserGoalsAndToolKitCategory, which is not used from app side(in app side they are using gettoolkitCategory resolver name)
 */
export interface ToolKitByUserGoalsAndToolKitCategoryResponse {
  tool_kit_category_info: ToolKitcategoryInfo;
  sub_categories: Array<ToolKitSubCategoriesAndToolKits>;
  whats_new_tool_kits: Array<ToolKitByToolKit>;
}

export interface ToolKitcategoryInfo {
  id: string;
  title: string;
  description: string;
}

export interface ToolKitSubCategoriesAndToolKits {
  id: string;
  title: string;
  tool_kits: Array<ToolKitByToolKit>;
}

/**
 *@deprecated dto are used in PurchaseReminderTone action,which is not used from app side(in app side they are using purchaseReminderTone)
 */
export class BuyReminderToneDTO {
  @IsUUID()
  @IsNotEmpty()
  user_id: string;

  @IsUUID()
  @IsNotEmpty()
  reminder_tone_id: string;
}

/**
 * @deprecated Action name is CheckIfUserHasJoinedChallenge, which is not used from app side(in app side they are using @function getToolkitDetails() and  getTookitDetails resover name )
 */
export class UserHasJoinedChallengeDTO {
  @IsUUID()
  @IsNotEmpty()
  tool_kit_id: string;

  @IsUUID()
  @IsNotEmpty()
  schedule_id: string;
}
export class UserReminderTone {
  id: string;
  user_id: string;
  reminder_tone_id: string;
  created_at: string;
  updated_at: string;
}

export class ReminderTone {
  id: string;
  hlp_points_needed_to_purchase_this_tone: number;
}

export class ExtraInformationDTO {
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  extra_info_type: string;
}

export enum ExtraInformationType {
  REWARD_HISTORY = 'REWARD_HISTORY',
  BONUSES = 'BONUSES',
  PROFILE = 'PROFILE',
  CHECK_INS = 'CHECK_INS',
  TOOL_KIT = 'TOOL_KIT',
  CHALLENGE = 'CHALLENGE',
  CHANNEL = 'CHANNEL',
  EMERGENCY_RESOURCES = 'EMERGENCY_RESOURCES',
  COMMUNITY_RULES = 'COMMUNITY_RULES',
  FAQ = 'FAQ',
  SERVICES = 'SERVICES',
  SERVICE_DETAIL = 'SERVICE_DETAIL',
  OFFER_DETAIL = 'OFFER_DETAIL',
  GOALS = 'GOALS',
  SCORE = 'SCORE',
  MY_HOSPITAL = 'MY_HOSPITAL',
  MY_BALANCE = 'MY_BALANCE',
  MOOD_CHECK = 'MOOD_CHECK',
  SETTINGS = 'SETTINGS',
  MY_INSIGHTS = 'MY_INSIGHTS',
  ACTIVITY_INSIGHTS = 'ACTIVITY_INSIGHTS',
  SLEEP_INSIGHTS = 'SLEEP_INSIGHTS',
}

// export enum ExtraInformationTypesTableNames {
//   REWARD_HISTORY = 'extra_informations',
//   BONUSES = 'extra_informations',
//   PROFILE = 'extra_informations',
//   CHECK_INS = 'extra_informations',
//   TOOL_KIT = 'tool_kits',
//   CHALLENGE = 'challenges',
//   CHANNEL = 'channels',
//   EMERGENCY_RESOURCES = 'extra_informations',
//   COMMUNITY_RULES = 'extra_informations',
//   FAQ = 'faq',
//   SERVICES = 'extra_informations',
//   SERVICE_DETAIL = 'extra_informations',
//   OFFER_DETAIL = 'service_offers',
// }

export interface PurchaseShopItemStripeMetaData {
  user_id: string;
  shop_item_id: string;
}

export class PurchaseShopItemResponseDto {
  message: string;
}

export class PurchaseShopItemBodyDto {
  @IsUUID()
  shopitemId: string;
}

@ObjectType()
export class ShopitemPurchase {
  @Field(() => String)
  id: string;
  @Field(() => String)
  user_id: string;
  @Field(() => String)
  shop_item_id: string;
  @Field(() => Number, { nullable: true })
  hlp_reward_points_redeemd?: number;
  @Field(() => Number, { deprecationReason: 'deprecated' })
  amount_paid_by_user?: number;
  @Field(() => String)
  transaction_status: string;
  @Field(() => String, { nullable: true })
  transaction_reference_id?: string;
  @Field(() => String, { nullable: true })
  voucher_code?: string;
  @Field(() => Number)
  item_price: number;
  @Field(() => Boolean, { nullable: true })
  is_redeemed?: boolean;
  @Field(() => GraphQLISODateTime, { nullable: true })
  created_at?: string;
  @Field(() => GraphQLISODateTime, { nullable: true })
  updated_at?: string;
  @Field(() => String)
  user_address_id: string;
  @Field(() => String, { nullable: true })
  event_id?: string;
  @Field(() => String, { nullable: true })
  payment_type?: string;
  @Field(() => Number, { description: 'tax amount', nullable: true })
  tax?: number;
  @Field(() => Number, { nullable: true })
  tax_percentage?: number;
  @Field(() => Number, { nullable: true })
  shipping_charges?: number;
  @Field(() => Number)
  order_id: number;
  @Field(() => Number)
  sub_total: number;
  @Field(() => String)
  grand_total: string;
  @Field(() => String, { nullable: true })
  item_size?: string;
  @Field(() => Number)
  item_quantity: number;
}

export class SaveShopitemPurchase extends PickType(ShopitemPurchase, [
  'user_id',
  'shop_item_id',
  'hlp_reward_points_redeemd',
  'transaction_status',
  'voucher_code',
  'item_price',
]) {}

export enum PaymentTransactionStatus {
  'PENDING' = 'PENDING',
  'SUCCESS' = 'SUCCESS',
  'FAILED' = 'FAILED',
  'CACNELED' = 'CACNELED',
}

export class UserDonation {
  @IsUUID()
  @IsNotEmpty()
  donor_user_id: string;

  @Allow()
  updated_at?: string;

  @IsNumber()
  @IsNotEmpty()
  hlp_reward_points_donated: number;

  @Allow()
  created_at?: string;

  @IsUUID()
  @IsNotEmpty()
  receiver_user_id: string;

  @IsUUID()
  id?: string;

  @IsUUID()
  @IsOptional()
  post_id?: string;
}

export class DonateBodyData {
  @ValidateNested()
  @IsNotEmpty()
  @Type(() => UserDonation)
  data: UserDonation;
}

export class CampaignDonation {
  hlp_reward_points_donated: number;
  created_at: string;
  updated_at: string;
  campaign_id: string;
  id: string;
  user_id: string;
}

export class CommonResponseMessage {
  message: string;
}

export class DynamicLinkDto {
  @IsNotEmpty()
  @IsString()
  link: string;
}

export class UserFriends {
  id: string;
  user_id: string;
  friend_id: string;
  created_at: string;
  updated_at: string;
}

export class UserFriendsBody extends UserFriends {
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @IsNotEmpty()
  @IsUUID()
  user_id: string;

  @IsNotEmpty()
  @IsUUID()
  friend_id: string;
}

/**
 *@description dto are used in follow controller action
 */
export class UserFriendsBodyDTO {
  @Type(() => UserFriendsBody)
  @ValidateNested()
  @IsObject()
  data: UserFriendsBody;
}

export type GetShopItemByIdAndUserMembershipStagesResponse = {
  shop_item: ShopItem;
  membership_stages: UserMembershipStage[];
};

export class ShopItemPrice {
  hlp_reward_points_required: number;
  item_price: number;
  created_at: string;
  updated_at: string;
  id: string;
  membership_stage_id: string;
  shop_item_id: string;
  shop_item: ShopItem;
}
@ObjectType()
export class UserNotificationSettings {
  @Field()
  allow_community_email_notification: boolean;
  @Field()
  allow_community_push_notification: boolean;
  @Field()
  allow_informational_email_notification: boolean;
  @Field()
  allow_post_reaction_email_notification: boolean;
  @Field()
  allow_post_reaction_push_notification: boolean;
  @Field()
  allow_reminder_email_notification: boolean;
  @Field()
  allow_reminder_push_notification: boolean;
  @Field()
  play_reminder_sound: boolean;
  @Field()
  reminder_sound: string;

  @Field(() => String, { nullable: true })
  reminder_sound_name?: string;

  @Field(() => GraphQLISODateTime)
  created_at: string;
  @Field(() => GraphQLISODateTime)
  updated_at: string;
  @Field()
  id: string;
  @Field()
  user_id: string;
  @Field()
  allow_calender_events: boolean;
}

/**
 * @deprecated dto are used in getToolKitHistory action, which is not used from app side(in app side they are using GetToolkitAnswersHistory resolver name)
 */
class ToolKitAnswerHistoryRewardDTO {
  earned: number;
  bonuses: number;
}

/**
 * @deprecated dto are used in getToolKitHistory action, which is not used from app side(in app side they are using GetToolkitAnswersHistory resolver name)
 */
export class ToolKitAnswerHistoryDTO {
  history: ToolKitAnswerHistory[];
  hlp_reward_points_earned: number;
  streaks: ToolkitStreak[];
  rewards: ToolKitAnswerHistoryRewardDTO;
}
export class FragmentAndFieldNameDto {
  fragment: string;
  name: string;
  fieldName: string;
}

/**
 * @deprecated dto are used in getToolKitHistory action, which is not used from app side(in app side they are using GetToolkitAnswersHistory resolver name)
 */
export type FragmentsAndFieldNameDto = FragmentAndFieldNameDto | undefined;

/**
 * @deprecated dto are used in getToolKitHistory action, which is not used from app side(in app side they are using GetToolkitAnswersHistory resolver name)
 */
export type ToolKitTypesAnswerTablesDto = ToolKitTypesAnswerTables | undefined;

export class updateScreeNameResponseDto {
  insert_onboardings_one: unknown;
}
export class UserChallengesResponseDto {
  table_name: string;
  user_challenges: any;
}

export class GetHabitToolEndDateResponseDto {
  endDate: Date;
}
export class GetHabitToolEndDateNullResponseDto {
  endDate: null;
}
export type GetHabitToolEndDateResponse =
  | GetHabitToolEndDateResponseDto
  | GetHabitToolEndDateNullResponseDto;

export interface ShopitemPurchaseData {
  shopitemPurchase: ShopitemPurchase;
}
