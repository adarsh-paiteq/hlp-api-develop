import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field } from '@nestjs/graphql';
import { IsJWT, IsNotEmpty, IsString, IsUUID } from 'class-validator';

@ArgsType()
export class VerifyDoctorEmailArgs {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field()
  id: string;

  @IsJWT({ message: i18nValidationMessage('is_jwt') })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field()
  token: string;
}
