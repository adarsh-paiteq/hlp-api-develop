import { i18nValidationMessage } from '@core/modules/i18n-next';
import { Form } from '@forms/entities/form.entity';
import { ArgsType, Field, ObjectType, OmitType } from '@nestjs/graphql';
import { ScheduleEntity } from '@schedules/entities/schedule.entity';
import { Toolkit } from '@toolkits/toolkits.model';
import { IsDateString, IsISO8601, IsNotEmpty, IsUUID } from 'class-validator';

@ArgsType()
export class GetFormToolkitDetailsArgs {
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field(() => String)
  schedule_id: string;

  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field(() => String)
  toolkit_id: string;

  @Field(() => String)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  @IsISO8601({ strict: true }, { message: i18nValidationMessage('IsISO8601') })
  date: string;
}

@ObjectType()
export class FormWithSessions extends OmitType(Form, [
  'created_at',
  'updated_at',
]) {
  @Field()
  is_completed: boolean;
  @Field({ nullable: true })
  session_id?: string;
}

@ObjectType()
export class GetFormToolkitDetails {
  @Field(() => ScheduleEntity)
  schedule: ScheduleEntity;

  @Field(() => Toolkit)
  toolkit: Toolkit;

  @Field(() => [FormWithSessions], { nullable: true })
  form_sessions?: FormWithSessions[];
}

@ObjectType()
export class GetFormToolkitDetailResponse {
  @Field(() => GetFormToolkitDetails, { nullable: true })
  form_toolkit_details: GetFormToolkitDetails;
}
