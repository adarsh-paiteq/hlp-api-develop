import { i18nValidationMessage } from '@core/modules/i18n-next';
import { Doctor } from '@doctors/entities/doctors.entity';
import { Form } from '@forms/entities/form.entity';
import { ArgsType, Field, ObjectType, OmitType } from '@nestjs/graphql';
import { ScheduleEntity } from '@schedules/entities/schedule.entity';
import { UserAppointment } from '@toolkits/entities/user-appointment.entity';
import { Users } from '@users/users.model';
import { IsDateString, IsISO8601, IsNotEmpty, IsUUID } from 'class-validator';

@ArgsType()
export class GetAppointmentDetailsArgs {
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field(() => String)
  schedule_id: string;

  @Field(() => String)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  @IsISO8601({ strict: true }) //TODO: add error message
  date: string;
}

@ObjectType()
export class FormWithStatus extends OmitType(Form, [
  'created_at',
  'updated_at',
]) {
  @Field()
  is_completed: boolean;
  @Field({ nullable: true })
  session_id?: string;
}
@ObjectType()
export class UserAppointmentDetails extends UserAppointment {
  @Field(() => Doctor)
  doctor: Doctor;

  @Field(() => Users)
  users: Users;
}
@ObjectType()
export class GetAppointmentDetailsResponse {
  @Field(() => UserAppointmentDetails)
  user_appointment_details: UserAppointmentDetails;

  @Field(() => ScheduleEntity)
  schedule: ScheduleEntity;

  @Field(() => [FormWithStatus], { nullable: true })
  forms_with_status?: FormWithStatus[];

  @Field(() => String)
  appointment_session_id: string;

  @Field(() => String)
  explain_appointment: string;
}
