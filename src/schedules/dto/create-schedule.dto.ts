import {
  Field,
  InputType,
  ObjectType,
  OmitType,
  PartialType,
} from '@nestjs/graphql';
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
import { ScheduleFor, ScheduleType } from '../entities/schedule.entity';
import { GraphQLBoolean, GraphQLInt } from 'graphql';
import { Type } from 'class-transformer';
import { ToolkitType } from '../../toolkits/toolkits.model';
import { i18nValidationMessage } from '@core/modules/i18n-next';
import { UserTookit } from '../../toolkits/entities/user-toolkits.entity';
import { AppointmentType } from '@toolkits/entities/user-appointment.entity';
import { UpdateMedicationInfoInput } from './update-schedule.dto';

export const validScheduleDays = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
];

export const toolkitsWithSelectOption = [
  ToolkitType.STEPS,
  ToolkitType.SLEEP_CHECK,
  ToolkitType.ALCOHOL_INTAKE,
  ToolkitType.SPORT,
];
@InputType()
export class UserAppointmentInput {
  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  user_id: string;

  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  doctor_id: string;

  @Field(() => AppointmentType)
  @IsEnum(AppointmentType, { message: i18nValidationMessage('is_enum') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  appointment_type: AppointmentType;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  location: string;

  @Field(() => String, { nullable: true })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  note?: string;

  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @Field()
  session_form_enabled: boolean;

  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @Field()
  complaint_form_enabled: boolean;
}

@InputType()
export class ScheduleInput {
  @Field(() => String, { nullable: true })
  @ValidateIf((obj: ScheduleInput) => obj.schedule_for === ScheduleFor.TOOL_KIT)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  tool_kit?: string;

  @Field(() => String, { nullable: true })
  @ValidateIf(
    (obj: ScheduleInput) => obj.schedule_for === ScheduleFor.USER_TOOLKIT,
  )
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsString({ message: i18nValidationMessage('is_string') })
  user_toolkit_title?: string;

  @Field(() => String, { nullable: true })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsString({ message: i18nValidationMessage('is_string') })
  user_toolkit_note?: string;

  @Field(() => ScheduleFor)
  @IsEnum(ScheduleFor, { message: i18nValidationMessage('is_enum') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  schedule_for: ScheduleFor;

  @Field(() => ScheduleType)
  @IsEnum(ScheduleType, { message: i18nValidationMessage('is_enum') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  schedule_type: ScheduleType;

  @Field(() => String)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsISO8601(
    { strict: true },
    { each: true, message: i18nValidationMessage('IsISO8601') },
  )
  start_date: string;

  @Field(() => GraphQLBoolean, { nullable: true })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  is_repeat_disabled?: boolean;

  @Field(() => String, { nullable: true })
  @ValidateIf((obj: ScheduleInput) => !!obj.is_repeat_disabled)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsISO8601(
    { strict: true },
    { each: true, message: i18nValidationMessage('IsISO8601') },
  )
  end_date?: string;

  @Field(() => GraphQLBoolean)
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  show_reminder: boolean;

  @Field(() => GraphQLInt, { nullable: true })
  @IsNumber({}, { message: i18nValidationMessage('is_number') })
  @Min(1, { message: i18nValidationMessage('min_length_1') })
  @Max(7, { message: i18nValidationMessage('min_length_7') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @ValidateIf(
    (obj: ScheduleInput) => obj.schedule_for !== ScheduleFor.APPOINTMENT,
  )
  repeat_per_day: number;

  @ValidateIf((obj) => obj.schedule_type === ScheduleType.WEEKLY)
  @ArrayNotEmpty()
  @Field(() => [String], { nullable: true })
  schedule_days?: string[];

  @ValidateIf((obj) => obj.schedule_type === ScheduleType.MONTHLY)
  @Field(() => [GraphQLInt], { nullable: true })
  @ArrayNotEmpty()
  repeat_per_month?: number[];

  @Field({ nullable: true })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  challenge_id?: string;

  @Field(() => UserAppointmentInput, { nullable: true })
  @Type(() => UserAppointmentInput)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  @IsObject()
  @ValidateIf(
    (obj: ScheduleInput) => obj.schedule_for === ScheduleFor.APPOINTMENT,
  )
  user_appointment?: UserAppointmentInput;
}

@InputType()
export class MedicationInfoInput {
  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  medication: string;

  @Field(() => Number)
  @IsNumber({}, { message: i18nValidationMessage('is_number') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  doses: number;

  @Field(() => Number)
  @IsNumber({}, { message: i18nValidationMessage('is_number') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  stock: number;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  instructions: string;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  strength: string;
}

@InputType()
export class CreateScheduleInput {
  @Field(() => ScheduleInput)
  @Type(() => ScheduleInput)
  @ValidateNested()
  @IsObject()
  schedule_input: ScheduleInput;

  @Field(() => [String], { nullable: 'items' })
  @IsISO8601({ strict: true }, { each: true })
  reminders: string[];

  @Field(() => String, { nullable: true })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  selected_option?: string;

  @Field(() => GraphQLInt, { nullable: true })
  @IsNumber({}, { message: i18nValidationMessage('is_number') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  selected_weight?: number;

  @Field(() => MedicationInfoInput, { nullable: true })
  @Type(() => MedicationInfoInput)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  @IsObject()
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  medication_info_input?: MedicationInfoInput;
}

@ObjectType()
export class CreateScheduleResponse {
  @Field(() => String)
  message: string;
}

export class ScheduleToolkitOptions {
  selected_option?: string | undefined;
  selected_weight?: number | undefined;
  medication_info_input?:
    | MedicationInfoInput
    | UpdateMedicationInfoInput
    | undefined;
}

export class ScheduleToolkitPlan {
  schedule_type: ScheduleType;
  repeat_per_day: number;
  repeat_per_month: number[] | undefined;
  schedule_days: string[] | undefined;
}

export class SaveUserToolkitInput extends OmitType(UserTookit, [
  'created_at',
  'updated_at',
  'id',
]) {}

export class SaveScheduleInput extends OmitType(ScheduleInput, [
  'user_appointment',
]) {
  id?: string;
  user: string;
  user_toolkit_id?: string;
  created_by: string;
  treatment_id?: string;
  user_appointment_id?: string;
  user_appointment_title?: string;
  session_form_id?: string;
  complaint_form_id?: string;
  is_schedule_disabled?: boolean;
}

export class SaveToolkitOptionsInput extends PartialType(MedicationInfoInput) {
  tool_kit_id: string;
  user_id: string;
  schedule_id: string;
  [key: string]: string | number | undefined;
}

export class SaveScheduleReminder {
  is_reminder_disabled: boolean;
  reminder_time: string;
  schedule_id: string;
  user_id: string;
}

export class SaveUserAppointmentInput extends UserAppointmentInput {
  id: string;
  //required when appointment is created from psyq
  psyq_appointment_id?: string;
}
