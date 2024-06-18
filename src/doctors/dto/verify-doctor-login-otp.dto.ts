import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsJWT, IsNotEmpty, IsString } from 'class-validator';
import { DoctorLoginResponse } from './doctor-login.dto';

@ArgsType()
export class VerifyDoctorLoginOtpArgs {
  @IsJWT({ message: i18nValidationMessage('is_jwt') })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field()
  token: string;

  @Field()
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  code: string;
}

@ObjectType()
export class VerifyDoctorLoginResponse extends DoctorLoginResponse {}
