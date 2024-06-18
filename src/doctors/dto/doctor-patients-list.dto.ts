import {
  Field,
  HideField,
  InputType,
  Int,
  ObjectType,
  PickType,
  registerEnumType,
} from '@nestjs/graphql';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { i18nValidationMessage } from '@core/modules/i18n-next';

import { TreatmentRoles } from '../../treatments/dto/add-treatment.dto';
import { Type } from 'class-transformer';
import { Users } from '../../users/users.model';
import { SortOrder, Translation } from '../../utils/utils.dto';
import { UserStatus } from '@users/entities/user-status-info.entity';

export enum PatientsListSortField {
  NAME = 'NAME',
  ROLE = 'ROLE',
  TREATMENT = 'TREATMENT',
  LAST_REGISTRATION = 'LAST_REGISTRATION',
  LAST_MESSAGE = 'LAST_MESSAGE',
  STATUS = 'STATUS',
  DEFAULT = 'DEFAULT',
}

registerEnumType(PatientsListSortField, { name: 'PatientsListSortField' });

@InputType()
export class DoctorPatientsListFilter {
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @Field(() => Boolean, { nullable: true })
  is_archived?: boolean;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @Field(() => [TreatmentRoles], {
    description: `role must be ${Object.values(TreatmentRoles)}`,
    nullable: true,
  })
  roles?: TreatmentRoles[];

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid'), each: true })
  @Field(() => [String], { description: 'treatments ids', nullable: true })
  treatments?: string[];
}

@InputType()
export class DoctorPatientsListInput {
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsString({ message: i18nValidationMessage('is_string') })
  @Field(() => String, { nullable: true })
  search?: string;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @Type(() => DoctorPatientsListFilter)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  @Field(() => DoctorPatientsListFilter, { nullable: true })
  filters?: DoctorPatientsListFilter;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsNumber({}, { message: i18nValidationMessage('is_number') })
  @Field(() => Int, {
    nullable: true,
    defaultValue: 9,
    description: 'default 9',
  })
  limit = 9;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsNumber({}, { message: i18nValidationMessage('is_number') })
  @Field(() => Int, {
    nullable: true,
    defaultValue: 1,
    description: 'default 1',
  })
  page = 1;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsEnum(PatientsListSortField, { message: i18nValidationMessage('is_enum') })
  @Field(() => PatientsListSortField, {
    nullable: true,
    defaultValue: PatientsListSortField.DEFAULT,
    description: `PatientsListSortField must be ${Object.values(
      PatientsListSortField,
    )}`,
  })
  sort_field: PatientsListSortField;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsEnum(SortOrder, { message: i18nValidationMessage('is_enum') })
  @Field(() => SortOrder, {
    nullable: true,
    defaultValue: SortOrder.DESC,
    description: `SortOrder must be ${Object.values(SortOrder)}`,
  })
  sort_order: SortOrder;
}

@ObjectType()
export class DoctorPatientsListOutput {
  @Field(() => [PatientsList], { nullable: true })
  patients: PatientsList[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;
}

@ObjectType()
export class PatientsList extends PickType(Users, [
  'avatar_image_name',
  'first_name',
  'last_name',
  'full_name',
]) {
  @Field(() => String, {
    description: 'This field represents the treatment id',
  })
  id: string;

  @Field(() => String)
  user_id: string;

  @Field(() => String, {
    description: 'This field represents the doctor treatment id',
  })
  treatment_id: string;

  @Field(() => String)
  title: string;

  @Field(() => String)
  role: string;

  @Field(() => String)
  last_registration: string;

  @Field(() => Boolean)
  is_owner: boolean;

  @HideField()
  translations: Translation;

  @Field(() => String, {
    nullable: true,
  })
  last_message: string;

  @Field(() => String, {
    nullable: true,
  })
  status: UserStatus;
}

export const patientsListSortField = new Map<PatientsListSortField, string>([
  [PatientsListSortField.DEFAULT, 'doctor_treatments.created_at'],
  [PatientsListSortField.NAME, 'users.full_name'],
  [PatientsListSortField.ROLE, 'doctor_treatments.role'],
  [PatientsListSortField.TREATMENT, 'treatment_options.title'],
  [PatientsListSortField.LAST_REGISTRATION, 'users.created_at'],
  [PatientsListSortField.STATUS, 'user_status_info.status'],
  [PatientsListSortField.LAST_MESSAGE, 'chat_messages.updated_at'],
]);
