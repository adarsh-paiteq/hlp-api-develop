import { i18nValidationMessage } from '@core/modules/i18n-next';
import { Field, InputType, Int, ObjectType, OmitType } from '@nestjs/graphql';
import { ScheduleEntity } from '@schedules/entities/schedule.entity';
import { UserAppointment } from '@toolkits/entities/user-appointment.entity';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
} from 'class-validator';

@InputType()
export class SaveUserAppointmentAnswerInput {
  @Field(() => String, {
    description:
      'The user_appointment_answers table has a toolkit_id column, and it uses the appointment_id in the same table to store appointment data for the user',
  })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  appointment_id: string;

  @Field(() => String)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  schedule_id: string;

  @Field(() => String)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  appointment_session_id: string;

  @Field(() => String, { nullable: true })
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  session_date?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsNumber({}, { message: i18nValidationMessage('is_number') })
  feeling?: number;

  @Field(() => String, { nullable: true })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsString({ message: i18nValidationMessage('is_string') })
  note_image_id?: string;

  @Field(() => String, { nullable: true })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsString({ message: i18nValidationMessage('is_string') })
  note_image_file_path?: string;

  @Field(() => String, { nullable: true })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsUrl({}, { message: i18nValidationMessage('is_url') })
  @IsString({ message: i18nValidationMessage('is_string') })
  note_image_url?: string;

  @Field(() => String, { nullable: true })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsString({ message: i18nValidationMessage('is_string') })
  note?: string;
}
@ObjectType()
export class SaveUserAppointmentAnswerResponse {
  @Field(() => String)
  message: string;
}

@ObjectType()
export class GetAppointmentSchedules {
  @Field(() => UserAppointment)
  user_appointment: UserAppointment;

  @Field(() => ScheduleEntity)
  schedule: ScheduleEntity;
}
export class InsertUserAppointmentAnswerInput extends OmitType(
  SaveUserAppointmentAnswerInput,
  ['appointment_session_id'],
) {
  id: string;
  user_id: string;
  hlp_points_earned: number;
  session_date: string;
  session_time: string;
  session_id: string;
}
