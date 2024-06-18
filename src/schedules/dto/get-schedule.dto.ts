import {
  ArgsType,
  Field,
  GraphQLISODateTime,
  ObjectType,
  OmitType,
} from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { ScheduleEntity } from '../entities/schedule.entity';
import { ScheduleReminder } from '../entities/schedule-reminder.entity';
import { i18nValidationMessage } from '@core/modules/i18n-next';
import { UserAppointment } from '@toolkits/entities/user-appointment.entity';
import { UserTookit } from '@toolkits/entities/user-toolkits.entity';
@ArgsType()
export class GetScheduleArgs {
  @Field()
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  scheduleId: string;
}

@ObjectType()
export class ScheduleData extends OmitType(ScheduleEntity, [
  'created_at',
  'updated_at',
]) {
  @Field(() => GraphQLISODateTime)
  created_at: Date;
  @Field(() => GraphQLISODateTime)
  updated_at: Date;
}

@ObjectType()
export class UserAppointmentData extends OmitType(UserAppointment, [
  'created_at',
  'updated_at',
]) {
  @Field(() => String)
  created_at: Date;

  @Field(() => String)
  updated_at: Date;
}
@ObjectType()
export class UserScheduleData extends ScheduleData {
  @Field(() => [ScheduleReminder], { nullable: true })
  schedule_reminders: ScheduleReminder[];
  @Field(() => UserTookit, { nullable: true })
  user_toolkit: UserTookit;
  @Field(() => UserAppointmentData, { nullable: true })
  user_appointment: UserAppointmentData;
}

@ObjectType()
export class GetScheduleResponse {
  @Field(() => UserScheduleData, { nullable: true })
  schedule: UserScheduleData;
}
