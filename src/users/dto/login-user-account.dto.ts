import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field, ObjectType, PickType } from '@nestjs/graphql';
import { UserSecurityAndPrivacySetting } from '@users/entities/user-security-and-privacy-settings.entity';
import { UserRoles } from '@users/users.dto';
import { GenerateTokens, LoginOnboarding } from '@users/users.model';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';

@ArgsType()
export class LoginArgs {
  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsEmail({}, { message: i18nValidationMessage('is_email') })
  email: string;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  password: string;

  @IsEnum(UserRoles, { message: i18nValidationMessage('is_enum') })
  @Field(() => UserRoles, {
    nullable: false,
    description: `Role must be ${Object.values(UserRoles)}`,
  })
  role: UserRoles;
}

@ObjectType()
export class UserSecuritySetting extends PickType(
  UserSecurityAndPrivacySetting,
  ['app_lock_enabled', 'otp_login_enabled'],
) {}

@ObjectType()
export class LoginResponse extends GenerateTokens {
  @Field(() => LoginOnboarding)
  onboarding: LoginOnboarding;

  @Field(() => UserSecuritySetting)
  userSecuritySettings: UserSecuritySetting;
}
