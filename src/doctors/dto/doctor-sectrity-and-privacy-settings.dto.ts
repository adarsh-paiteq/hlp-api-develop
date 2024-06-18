import { i18nValidationMessage } from '@core/modules/i18n-next';
import { Field, InputType, ObjectType, PartialType } from '@nestjs/graphql';
import { UserSecurityAndPrivacySetting } from '@users/entities/user-security-and-privacy-settings.entity';
import { IsBoolean, IsOptional } from 'class-validator';

@ObjectType()
export class UpdateDoctorSecurityAndPrivacySettingResp {
  @Field(() => UserSecurityAndPrivacySetting)
  securityAndPrivacySettings: UserSecurityAndPrivacySetting;
}

@InputType()
export class UpdateDoctorSecurityAndPrivacySettingInput {
  @Field({ nullable: true })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  app_lock_enabled: boolean;

  @Field({ nullable: true })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  otp_login_enabled: boolean;

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
}

export class UpdateDoctorSecurityAndPrivacySettingDto extends PartialType(
  UserSecurityAndPrivacySetting,
) {}
