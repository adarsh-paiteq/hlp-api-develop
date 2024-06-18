import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { OmitType } from '@nestjs/mapped-types';
import {
  SaveScheduleInput,
  UserAppointmentInput,
} from '@schedules/dto/create-schedule.dto';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

@ArgsType()
export class SyncPsyqPatientAppointmentArgs {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field(() => String)
  user_id: string;
}

@ObjectType()
export class PatientDocument {
  @Field(() => String)
  id: string;
  @Field(() => String)
  file_path: string;
  @Field(() => String)
  image_url: string;
  @Field(() => String, { nullable: true })
  title?: string;
  @Field(() => String, { nullable: true })
  description?: string;
}

@ObjectType()
export class SyncPsyqPatientAppointmentResponse {
  @Field(() => String)
  message: string;

  @Field(() => PatientDocument)
  patientDocument?: PatientDocument;
}

export class PsyQConnectionUserAppointment extends UserAppointmentInput {
  psyq_appointment_id: string;
}

export class SavePsyqAppointmentScheduleInput extends OmitType(
  SaveScheduleInput,
  ['user'],
) {
  user?: string;
}
