import { i18nValidationMessage } from '@core/modules/i18n-next';
import {
  ArgsType,
  Field,
  ObjectType,
  OmitType,
  PickType,
} from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { GenerateTokens } from '../../users/users.model';
import { UserSecurityAndPrivacySetting } from '@users/entities/user-security-and-privacy-settings.entity';

@ArgsType()
export class DoctorLoginArgs {
  @Field()
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsEmail({}, { message: i18nValidationMessage('is_email') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  email: string;

  @Field()
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  password: string;
}

@ObjectType()
export class DoctorOnboardingScreens {
  @Field(() => Boolean)
  isOnboarded: boolean;

  @Field(() => Boolean)
  isPasswordSet: boolean;

  @Field(() => Boolean)
  isScreenNameSet: boolean;

  @Field(() => Boolean)
  isProfilePictureSet: boolean;

  @Field(() => Boolean)
  isEmailVerified: boolean;
}

@ObjectType()
export class SecuritySettings extends PickType(UserSecurityAndPrivacySetting, [
  'app_lock_enabled',
  'otp_login_enabled',
]) {}

@ObjectType()
export class DoctorLoginResponse extends GenerateTokens {
  @Field(() => DoctorOnboardingScreens)
  onboardingScreens: DoctorOnboardingScreens;

  @Field(() => SecuritySettings)
  securitySettings: SecuritySettings;
}

export class SendDoctorLoginOtpResponse extends OmitType(DoctorLoginResponse, [
  'securitySettings',
]) {}
