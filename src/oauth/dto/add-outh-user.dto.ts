import { i18nValidationMessage } from '@core/modules/i18n-next';
import { Field, InputType, ObjectType, OmitType } from '@nestjs/graphql';
import { EpdCode, OauthUserAddedBy } from '@oauth/entities/oauth-users.entity';
import { Gender } from '@users/users.model';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

@InputType()
export class AddOauthUserInput {
  @Field(() => String, { nullable: true })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsString({ message: i18nValidationMessage('is_string') })
  organisation_patient_id?: string;

  @Field(() => String, { nullable: true })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsString({ message: i18nValidationMessage('is_string') })
  organisation_allocation_code?: string;

  @Field(() => String, { nullable: true })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsString({ message: i18nValidationMessage('is_string') })
  first_name?: string;

  @Field(() => String, { nullable: true })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsString({ message: i18nValidationMessage('is_string') })
  last_name?: string;

  @Field(() => String, { nullable: true })
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  birth_date?: string;

  @Field(() => String, { nullable: true })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsNumberString({ message: i18nValidationMessage('is_string') })
  telephone_number?: string;

  @Field(() => String)
  @IsEmail({}, { message: i18nValidationMessage('is_email') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  email: string;

  @Field(() => EpdCode, { nullable: true })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsEnum(EpdCode, { message: i18nValidationMessage('is_enum') })
  epd_code?: EpdCode;

  @Field(() => String, { nullable: true })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  gender?: Gender;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  organisation_id: string;

  @Field(() => String, { nullable: true })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  client_id?: string;
}

export class AddOauthUser extends OmitType(AddOauthUserInput, [
  'first_name',
  'last_name',
]) {
  added_by: OauthUserAddedBy;
  activation_code: string;
  display_name?: string;
}

@ObjectType()
export class AddOauthUserResponse {
  @Field(() => String)
  message: string;
}
