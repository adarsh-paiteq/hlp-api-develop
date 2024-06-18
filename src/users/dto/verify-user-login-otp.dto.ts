import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsJWT, IsNotEmpty, IsString } from 'class-validator';
import { LoginResponse } from './login-user-account.dto';

@ArgsType()
export class VerifyUserLoginOtpArgs {
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
export class VerifyUserLoginResponse extends LoginResponse {}
