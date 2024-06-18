import { i18nValidationMessage } from '@core/modules/i18n-next';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { UserNotificationSettings } from '@users/users.dto';
import { IsBoolean, IsOptional } from 'class-validator';

@ObjectType()
export class UpdateDoctorNotificationSettingsResp {
  @Field(() => UserNotificationSettings)
  notificationSettings: UserNotificationSettings;
}

@InputType()
export class UpdateDoctorNotificationSettingsInput {
  @Field({ nullable: true })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  play_reminder_sound: boolean;

  @Field({ nullable: true })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  allow_reminder_email_notification: boolean;

  @Field({ nullable: true })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  allow_reminder_push_notification: boolean;

  @Field({ nullable: true })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  allow_community_email_notification: boolean;

  @Field({ nullable: true })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  allow_community_push_notification: boolean;

  @Field({ nullable: true })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  allow_post_reaction_email_notification: boolean;

  @Field({ nullable: true })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  allow_post_reaction_push_notification: boolean;

  @Field({ nullable: true })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  allow_informational_email_notification: boolean;
}
