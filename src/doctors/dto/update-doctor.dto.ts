import { ArgsType, Field, InputType, ObjectType } from '@nestjs/graphql';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
} from 'class-validator';
import { i18nValidationMessage } from '@core/modules/i18n-next';
import { Doctor } from '../entities/doctors.entity';
import { GetDoctorArgs } from './get-doctor.dto';
import { Gender } from '@users/users.model';

@InputType()
export class UpdateDoctorInput {
  @Field({ nullable: true })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  first_name?: string;

  @Field({ nullable: true })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  last_name?: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsEmail({}, { message: i18nValidationMessage('is_email":') })
  @Field({ nullable: true })
  email?: string;

  @Field(() => Gender, {
    nullable: true,
    description: `Gender must be ${Object.values(Gender)}`,
  })
  @IsEnum(Gender, { message: i18nValidationMessage('is_enum') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  gender?: Gender;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field({ nullable: true })
  organization_id?: string;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  @Field({ nullable: true })
  date_of_birth?: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @Field({ nullable: true })
  birth_place?: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @Field({ nullable: true })
  street?: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @Field({ nullable: true })
  land_mark?: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @Field({ nullable: true })
  post_code?: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsPhoneNumber(undefined, {
    message: i18nValidationMessage('is_phone_number'),
  })
  @Field({ nullable: true })
  phone_number?: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @Field({ nullable: true })
  place?: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsPhoneNumber(undefined, {
    message: i18nValidationMessage('is_phone_number'),
  })
  @Field({ nullable: true })
  mobile_number?: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @Field({ nullable: true })
  company_name?: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @Field({ nullable: true })
  profession?: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @Field({ nullable: true })
  department?: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @Field({ nullable: true })
  employee_number?: string;
}

@ArgsType()
export class UpdateDoctorArgs extends GetDoctorArgs {}
@ObjectType()
export class UpdateDoctorResponse extends Doctor {}
