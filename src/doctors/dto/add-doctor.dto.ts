import { Field, InputType, ObjectType } from '@nestjs/graphql';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
} from 'class-validator';
import { i18nValidationMessage } from '@core/modules/i18n-next';
import { UserRoles } from '../../users/users.dto';
import { Doctor } from '../entities/doctors.entity';
import {
  UserStatus,
  UserStatusChangedBy,
} from '@users/entities/user-status-info.entity';
import { AvatarType, Gender } from '@users/users.model';

@InputType()
export class CreateDoctorInput {
  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  first_name: string;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  last_name: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsEmail({}, { message: i18nValidationMessage('is_email":') })
  @Field(() => String)
  email: string;

  @Field(() => Gender, {
    nullable: false,
    description: `Gender must be ${Object.values(Gender)}`,
  })
  @IsEnum(Gender, { message: i18nValidationMessage('is_enum') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  gender: Gender;

  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field(() => String)
  organization_id: string;

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

export class InsertDoctor extends CreateDoctorInput {
  role: UserRoles;
  avatar_type: AvatarType;
  accepted_terms_and_conditions: boolean;
  last_login_time: Date;
  is_deleted: boolean;
}

@ObjectType()
export class AddDoctorResponse extends Doctor {}

export class InsertDoctorStatusInfo {
  status: UserStatus;
  user_id: string;
  status_changed_by: UserStatusChangedBy;
}
