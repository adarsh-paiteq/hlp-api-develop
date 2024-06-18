import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field } from '@nestjs/graphql';
import { PartialType } from '@nestjs/mapped-types';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  Matches,
  MinLength,
} from 'class-validator';
import { Doctor } from '../entities/doctors.entity';

@ArgsType()
export class RegisterPasswordArgs {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field()
  id: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field()
  @MinLength(8, { message: i18nValidationMessage('min_length_8') })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z0-9@$!%*?&]{8,}$/, {
    message: i18nValidationMessage('is_matches'),
  })
  password: string;
}
export class DoctorUpdateDto extends PartialType(Doctor) {}
