import {
  ArgsType,
  Field,
  GraphQLISODateTime,
  HideField,
  ObjectType,
  PartialType,
  PickType,
  registerEnumType,
} from '@nestjs/graphql';
import {
  IsNumber,
  IsOptional,
  IsUUID,
  IsString,
  IsEmail,
  MinLength,
  IsNotEmpty,
  IsEnum,
  IsBoolean,
  IsJWT,
  IsNumberString,
  MaxLength,
} from 'class-validator';
import { GraphQLBoolean, GraphQLInt } from 'graphql';
import { AgeGroups, UserRoles } from './users.dto';
import { i18nValidationMessage } from '@core/modules/i18n-next';

export enum Gender {
  male = 'male',
  female = 'female',
  other = 'other',
}

registerEnumType(Gender, { name: 'Gender' });

export enum Language {
  en = 'en',
  nl = 'nl',
}

export enum AvatarType {
  EMOJI = 'EMOJI',
  IMAGE = 'IMAGE',
}

registerEnumType(AvatarType, { name: 'AvatarType' });
registerEnumType(Gender, { name: 'Gender' });
registerEnumType(UserRoles, { name: 'UserRoles' });
registerEnumType(AgeGroups, { name: 'AgeGroups' });
registerEnumType(Language, { name: 'Language' });

export enum UserAccountType {
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
}
registerEnumType(UserAccountType, { name: 'UserAccountType' });

@ObjectType()
export class Users {
  id: string;
  full_name?: string;

  @Field({ nullable: true })
  user_name: string;

  @HideField()
  password: string;

  @Field({ nullable: true })
  puk_reference_id: string;

  @Field({ nullable: true })
  age_group: string;

  accepted_terms_and_conditions: boolean;
  @Field({ nullable: true })
  avatar: string;

  role: string;
  last_login_time: Date;
  created_at: string;
  updated_at: string;

  @HideField()
  refresh_token: string;

  @Field({ nullable: true })
  email: string;

  @HideField()
  forgot_password_token: string;

  @HideField()
  app_access_pin: string;

  @Field({ nullable: true })
  app_lock_enabled: boolean;

  @HideField()
  email_verification_token: string;

  @HideField()
  forgot_pin_token: string;

  @Field({ nullable: true })
  current_membership_stage_id: string;

  @Field({ nullable: true })
  current_membership_level_id: string;

  @Field(() => GraphQLInt)
  hlp_reward_points_balance: number;

  is_test_puk: boolean;

  @HideField()
  email_verification_code?: string;

  @Field(() => Boolean, { defaultValue: false })
  is_moderator?: boolean;

  avatar_image_name?: string;

  is_deleted?: boolean;

  @Field({ nullable: true })
  first_name?: string;

  @Field({ nullable: true })
  last_name?: string;

  @Field({ nullable: true })
  date_of_birth?: Date;

  organization_id: string;

  @Field({ nullable: true })
  image_url?: string;

  @Field({ nullable: true })
  image_id?: string;

  @Field({ nullable: true })
  file_path?: string;

  invitation_id?: string;

  @Field(() => AvatarType)
  avatar_type: AvatarType;

  @Field(() => Boolean)
  is_onboarded: boolean;

  @Field({ nullable: true })
  gender?: Gender;

  @Field(() => Language)
  language: Language;

  @Field({ nullable: true })
  mobile_number?: string;

  @Field(() => UserAccountType)
  account_type?: UserAccountType;
}
@ArgsType()
export class UserDonationArgs {
  @IsNumber({}, { message: i18nValidationMessage('is_number') })
  @Field(() => GraphQLInt)
  hlpRewardPointsDonated: number;

  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  receiverUserId: string;

  @Field({ nullable: true })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  postId?: string;
}

export enum OnboardingScreen {
  avatar = 'avatar',
  pin_code = 'pin_code',
  screen_name = 'screen_name',
  goals = 'goals',
  email_verification = 'email_verification',
  user_name = 'user_name', //we using user_name for full name screen.
}

registerEnumType(OnboardingScreen, { name: 'OnboardingScreen' });

@ObjectType()
export class Onboarding {
  is_completed: boolean;
  screen: OnboardingScreen;
  userId: string;
}

@ObjectType()
export class OnboardingStatus extends Onboarding {
  isTestUser: boolean;
}

@ObjectType()
export class LoginOnboarding {
  screen: OnboardingScreen;
  is_completed: boolean;
}

@ArgsType()
export class UserSignupArgs extends PartialType(Users) {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsEmail({ message: i18nValidationMessage('is_email') })
  email: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @MinLength(8, { message: i18nValidationMessage('min_length_8') })
  password: string;

  @IsEnum(UserRoles, { message: i18nValidationMessage('is_enum') })
  @Field(() => UserRoles, {
    nullable: false,
    description: `UserRole must be ${UserRoles.USER}`,
  })
  role: UserRoles;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  puk_reference_id: string;

  @IsEnum(AgeGroups, { message: i18nValidationMessage('is_enum') })
  @Field(() => AgeGroups, {
    nullable: false,
    description: `Age Group must be ${Object.values(AgeGroups)}`,
  })
  age_group: AgeGroups;

  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @Field(() => GraphQLBoolean, { defaultValue: true })
  accepted_terms_and_conditions: boolean;

  @Field(() => GraphQLISODateTime, { defaultValue: new Date() })
  last_login_time: Date;

  @Field(() => GraphQLBoolean, { defaultValue: false })
  is_test_puk: boolean;
}

@ObjectType()
export class GenerateTokens {
  id: string;
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  external_user_id_auth_Hash: string;
  email_auth_hash: string;
}

@ObjectType()
export class UserSignupResponse extends GenerateTokens {}

export class AdminSignupResponse extends GenerateTokens {}

@ObjectType()
export class CheckPinResponse extends GenerateTokens {
  onboarding: LoginOnboarding;
}

@ArgsType()
export class RefreshTokenArgs {
  @IsJWT({ message: i18nValidationMessage('is_jwt') })
  token: string;
}

@ObjectType()
export class RefreshTokenResponse extends GenerateTokens {}

@ArgsType()
export class ForgetPasswordArgs {
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsEmail({}, { message: i18nValidationMessage('is_email') })
  email: string;
}
@ObjectType()
export class CommonResponseMessage {
  message: string;
}

@ArgsType()
export class CheckEmailArgs {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsEmail({}, { message: i18nValidationMessage('is_email') })
  email: string;

  @IsEnum(UserRoles, { message: i18nValidationMessage('is_enum') })
  @Field(() => UserRoles, {
    nullable: false,
    description: `UserRole must be ${UserRoles.USER}`,
  })
  role: UserRoles;
}

@ObjectType()
export class CheckEmailResponse {
  isExists: boolean;
}

@ArgsType()
export class ChangePasswordArgs {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  id: string;

  @IsJWT({ message: i18nValidationMessage('is_jwt') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  token: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @MinLength(8, { message: i18nValidationMessage('min_length_8') })
  password: string;
}

@ArgsType()
export class UpdateUserNameArgs {
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  id: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  user_name: string;

  @IsEnum(UserRoles, { message: i18nValidationMessage('is_enum') })
  @Field(() => UserRoles, {
    nullable: false,
    description: `UserRole must be ${UserRoles.USER}`,
  })
  role: UserRoles;
}

@ArgsType()
export class ChangePinArgs {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  user_id: string;

  @IsNumberString({}, { message: i18nValidationMessage('is_number_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @MaxLength(4, { message: i18nValidationMessage('min_length_4') })
  @MinLength(4, { message: i18nValidationMessage('max_length_4') })
  pin: string;

  @IsJWT({ message: i18nValidationMessage('is_jwt') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  token: string;
}

@ArgsType()
export class VerifyEmailArgs {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  user_id: string;

  @IsJWT({ message: i18nValidationMessage('is_jwt') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  token: string;
}

@ArgsType()
export class SendVerificationEmailArgs {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  user_id: string;
}

@ArgsType()
export class SendForgetPinEmailArgs extends ForgetPasswordArgs {}

@ArgsType()
export class AddPinArgs {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  user_id: string;

  @IsNumberString({}, { message: i18nValidationMessage('is_number_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @MaxLength(4, { message: i18nValidationMessage('max_length_4') })
  @MinLength(4, { message: i18nValidationMessage('min_length_4') })
  pin: string;
}

@ArgsType()
export class CheckPinArgs extends AddPinArgs {}

@ObjectType()
export class UserSecurityAndPrivacySettings {
  id: string;
  user_id: string;
  app_access_pin: string;
  app_lock_enabled: boolean;
  my_posts_can_be_seen_by_all_users: boolean;
  my_posts_can_be_seen_by_my_friends: boolean;
  created_at: string;
  updated_at: string;
}

@ObjectType()
export class HelpedUser extends PickType(Users, [
  'avatar',
  'full_name',
  'id',
  'user_name',
  'avatar_image_name',
  'avatar_type',
  'file_path',
]) {}

@ObjectType()
export class GetHelpedUsersResponse {
  @Field(() => [HelpedUser], { nullable: 'items' })
  users: HelpedUser[];
}

@ArgsType()
export class GetHelpedUsersArgs {
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  userId: string;
}

@ObjectType()
export class Friend extends HelpedUser {}

@ObjectType()
export class GetUserFriendsResponse {
  @Field(() => [HelpedUser], { nullable: 'items' })
  users: HelpedUser[];
}

@ArgsType()
export class GetUserFriendsArgs {
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  userId: string;
}

export class BlockedUser {
  created_at: string;
  updated_at: string;
  id: string;
  blocked_by_user_id: string;
  blocked_user_id: string;
}
@ArgsType()
export class ChangeAdminOrEditorPasswordArgs {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty()
  @MinLength(8)
  oldPassword: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;
}
