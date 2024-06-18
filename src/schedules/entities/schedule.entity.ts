import {
  Field,
  GraphQLISODateTime,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { GraphQLInt } from 'graphql';

export enum ScheduleType {
  ONE_TIME = 'ONETIME',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  HABIT = 'HABIT',
}

export enum ScheduleFor {
  TOOL_KIT = 'TOOL_KIT',
  CHECK_IN = 'CHECK_IN',
  USER_TOOLKIT = 'USER_TOOLKIT',
  APPOINTMENT = 'APPOINTMENT',
}

registerEnumType(ScheduleType, { name: 'ScheduleType' });
registerEnumType(ScheduleFor, { name: 'ScheduleFor' });

@ObjectType()
export class ScheduleEntity {
  id: string;
  tool_kit?: string;
  user: string;
  @Field(() => [GraphQLInt], { nullable: true })
  repeat_per_month?: number[];
  schedule_days?: string[];
  is_completed: boolean;
  is_schedule_disabled: boolean;
  show_reminder: boolean;

  @Field(() => GraphQLISODateTime)
  end_date?: string | Date | undefined;

  @Field(() => GraphQLISODateTime)
  start_date: string | Date;
  @Field(() => GraphQLInt, { nullable: true })
  repeat_per_day?: number;
  schedule_for: ScheduleFor;
  schedule_type: ScheduleType;
  created_at: string;
  updated_at: string;
  challenge_id?: string;
  check_in?: string;
  @Field(() => [String])
  calender_events: string[];
  user_toolkit_id?: string;
  user_toolkit_title?: string;
  user_toolkit_note?: string;
  created_by?: string;
  treatment_id?: string;
  user_appointment_id?: string;
  user_appointment_title?: string;
  session_form_id?: string;
  complaint_form_id?: string;
  is_repeat_disabled: boolean;
}
