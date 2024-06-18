import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field } from '@nestjs/graphql';
import {
  IsJWT,
  IsNotEmpty,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

@ArgsType()
export class DoctorResetPasswordArgs {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field()
  id: string;

  @IsJWT({ message: i18nValidationMessage('is_jwt') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field()
  token: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @MinLength(8, { message: i18nValidationMessage('min_length_8') })
  @Field()
  password: string;
}
