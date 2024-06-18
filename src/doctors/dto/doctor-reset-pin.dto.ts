import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsNumberString,
  MaxLength,
  MinLength,
} from 'class-validator';

@ArgsType()
export class ResetDoctorPinArgs {
  @IsNumberString({}, { message: i18nValidationMessage('is_number_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @MaxLength(4, { message: i18nValidationMessage('min_length_4') })
  @MinLength(4, { message: i18nValidationMessage('max_length_4') })
  @Field()
  pin: string;
}
