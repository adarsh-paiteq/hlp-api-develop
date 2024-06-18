import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { DoctorOnboardingScreens } from './doctor-login.dto';
import { Doctor } from '../entities/doctors.entity';

@ArgsType()
export class RegisterDoctorArgs {
  @Field()
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsEmail({}, { message: i18nValidationMessage('is_email') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  email: string;
}

@ObjectType()
export class DoctorRegisterResponse {
  @Field(() => Doctor)
  doctor: Doctor;

  @Field(() => DoctorOnboardingScreens)
  onboardingScreens: DoctorOnboardingScreens;
}
