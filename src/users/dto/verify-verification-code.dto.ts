import { ArgsType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, Length } from 'class-validator';
import { i18nValidationMessage } from '@core/modules/i18n-next';

@ArgsType()
export class VerifyVerificationCodeArgsDto {
  @IsString({ message: i18nValidationMessage('is_string') })
  @Length(4, 4, { message: i18nValidationMessage('max_length_4') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field()
  code: string;
}
