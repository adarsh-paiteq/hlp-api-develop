import { i18nValidationMessage } from '@core/modules/i18n-next';
import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsOptional } from 'class-validator';

@InputType()
export class UserSecurityAndPrivacySettingInput {
  @Field({ nullable: true })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  app_lock_enabled: boolean;

  @Field({ nullable: true })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  my_posts_can_be_seen_by_all_users: boolean;

  @Field({ nullable: true })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  my_posts_can_be_seen_by_my_friends: boolean;

  @Field({ nullable: true })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  is_profile_anonymous: boolean;

  @Field({ nullable: true })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  otp_login_enabled: boolean;
}
