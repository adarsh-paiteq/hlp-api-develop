import { i18nValidationMessage } from '@core/modules/i18n-next';
import { InputType, Field, ObjectType } from '@nestjs/graphql';
import { UserAccountType, Gender } from '@users/users.model';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

@InputType()
export class UserInput {
  @Field(() => String, { nullable: true })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  first_name?: string;

  @Field(() => String, { nullable: true })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  last_name?: string;

  @Field(() => String, { nullable: true })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  email?: string;

  @Field(() => String, { nullable: true })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsEnum(Gender, { message: i18nValidationMessage('is_enum') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  gender?: Gender;

  @Field(() => String, { nullable: true })
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  @IsISO8601({ strict: true }, { message: i18nValidationMessage('IsISO8601') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  date_of_birth?: Date;

  @Field(() => String, { nullable: true })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  mobile_number?: string;

  @Field(() => String, { nullable: true })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  user_name?: string;

  @Field(() => String, { nullable: true })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  organization_id?: string;

  @Field(() => String, { nullable: true })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsEnum(UserAccountType, { message: i18nValidationMessage('is_enum') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  account_type?: UserAccountType;
}

@InputType()
export class UpdateUserInput {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field(() => String)
  user_id: string;

  @IsObject({ message: i18nValidationMessage('is_object') })
  @Type(() => UserInput)
  @Field(() => UserInput)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  user_input: UserInput;
}

@ObjectType()
export class UpdateUserResponse {
  @Field()
  message: string;
}
