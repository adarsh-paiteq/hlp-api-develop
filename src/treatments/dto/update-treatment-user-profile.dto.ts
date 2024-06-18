import { i18nValidationMessage } from '@core/modules/i18n-next';
import {
  InputType,
  Field,
  GraphQLISODateTime,
  ObjectType,
} from '@nestjs/graphql';
import { Gender } from '@users/users.model';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

@InputType()
export class UpdateTreatmentUserProfileInput {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field(() => String)
  treatmentId: string;

  @Field(() => String, { nullable: true })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  first_name?: string;

  @Field(() => String, { nullable: true })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  last_name?: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsDate()
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  date_of_birth?: string;

  @Field(() => String, { nullable: true })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsEnum(Gender, { message: i18nValidationMessage('is_enum') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  gender?: Gender;
}

export class UpdateTreatmentUserProfileDto {
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  gender?: Gender;
}

@ObjectType()
export class UpdateTreatmentUserProfileResponse {
  @Field(() => String)
  message: string;
}
