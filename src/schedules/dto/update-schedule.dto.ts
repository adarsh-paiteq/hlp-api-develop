import { i18nValidationMessage } from '@core/modules/i18n-next';
import {
  Field,
  InputType,
  ObjectType,
  OmitType,
  PartialType,
} from '@nestjs/graphql';
import { ScheduleType } from '@schedules/entities/schedule.entity';
import { AppointmentType } from '@toolkits/entities/user-appointment.entity';
import { UserTookit } from '@toolkits/entities/user-toolkits.entity';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { GraphQLBoolean, GraphQLInt } from 'graphql';
import { MedicationInfoInput } from './create-schedule.dto';

@InputType()
export class UpdateMedicationInfoInput extends PartialType(
  MedicationInfoInput,
) {}

@InputType()
export class UpdateUserAppointmentInput {
  @Field(() => AppointmentType, { nullable: true })
  @IsEnum(AppointmentType, { message: i18nValidationMessage('is_enum') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  appointment_type?: AppointmentType;

  @Field(() => String, { nullable: true })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  location?: string;

  @Field(() => String, { nullable: true })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  note?: string;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @Field({ nullable: true })
  session_form_enabled?: boolean;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @Field({ nullable: true })
  complaint_form_enabled?: boolean;
}

@InputType()
export class UpdateScheduleData {
  @Field(() => String, { nullable: true })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsString({ message: i18nValidationMessage('is_string') })
  user_toolkit_title?: string;

  @Field(() => String, { nullable: true })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsString({ message: i18nValidationMessage('is_string') })
  user_toolkit_note?: string;

  @Field(() => ScheduleType, { nullable: true })
  @IsEnum(ScheduleType, { message: i18nValidationMessage('is_enum') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  schedule_type?: ScheduleType;

  @Field(() => String, { nullable: true })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsISO8601(
    { strict: true, each: true },
    { message: i18nValidationMessage('IsISO8601') },
  )
  start_date?: string;

  @Field(() => GraphQLBoolean, { nullable: true })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  is_repeat_disabled?: boolean;

  @Field(() => String, { nullable: true })
  @ValidateIf((obj: UpdateScheduleData) => obj.is_repeat_disabled === true)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsISO8601(
    { strict: true },
    { each: true, message: i18nValidationMessage('IsISO8601') },
  )
  end_date?: string;

  @Field(() => GraphQLBoolean, { nullable: true })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  show_reminder?: boolean;

  @Field(() => GraphQLInt, { nullable: true })
  @IsNumber({}, { message: i18nValidationMessage('is_number') })
  @Min(1, { message: i18nValidationMessage('min_length_1') })
  @Max(7, { message: i18nValidationMessage('min_length_7') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  repeat_per_day?: number;

  @ValidateIf((obj) => obj.schedule_type === ScheduleType.WEEKLY)
  @ArrayNotEmpty()
  @Field(() => [String], { nullable: true })
  schedule_days: string[];

  @ValidateIf((obj) => obj.schedule_type === ScheduleType.MONTHLY)
  @Field(() => [GraphQLInt], { nullable: true })
  @ArrayNotEmpty()
  repeat_per_month: number[];

  @Field(() => UpdateUserAppointmentInput, { nullable: true })
  @Type(() => UpdateUserAppointmentInput)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  @IsObject({ message: i18nValidationMessage('is_object') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  user_appointment?: UpdateUserAppointmentInput;
}

@InputType()
export class UpdateSchedule {
  @Field(() => UpdateScheduleData)
  @Type(() => UpdateScheduleData)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  @IsObject({ message: i18nValidationMessage('is_object') })
  schedule_input: UpdateScheduleData;

  @Field(() => [String], { nullable: true })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsISO8601(
    { strict: true },
    { each: true, message: i18nValidationMessage('IsISO8601') },
  )
  reminders?: string[];

  @Field(() => String, { nullable: true })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  selected_option?: string;

  @Field(() => GraphQLInt, { nullable: true })
  @IsNumber({}, { message: i18nValidationMessage('is_number') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  selected_weight?: number;

  @Field(() => UpdateMedicationInfoInput, { nullable: true })
  @Type(() => UpdateMedicationInfoInput)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  @IsObject()
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  medication_info_input?: UpdateMedicationInfoInput;
}

@InputType()
export class UpdateScheduleInput {
  @Field()
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  schedule_id: string;

  @IsObject({ message: i18nValidationMessage('is_object') })
  @Type(() => UpdateSchedule)
  @Field(() => UpdateSchedule)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  update_schedule: UpdateSchedule;
}

@ObjectType()
export class UpdateScheduleResponse {
  @Field(() => String)
  message: string;
}

export class UpdateUserToolkitInput extends PartialType(
  OmitType(UserTookit, ['id', 'created_at', 'updated_at', 'user_id']),
) {}

export class UpdateSchedulesInput extends OmitType(UpdateScheduleData, [
  'user_appointment',
]) {
  updated_by: string;
  user_toolkit_id?: string;
  user_appointment_id?: string;
  user_appointment_title?: string;
  session_form_id?: string;
  complaint_form_id?: string;
  is_schedule_disabled?: boolean;
}

export class UpdateToolkitOptionsInput extends PartialType(
  UpdateMedicationInfoInput,
) {
  [key: string]: string | number | undefined;
}
