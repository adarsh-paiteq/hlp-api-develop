import { ArgsType, Field, Int, ObjectType } from '@nestjs/graphql';
import { IsDateString, IsISO8601, IsNotEmpty, IsUUID } from 'class-validator';
import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ScheduleEntity } from '@schedules/entities/schedule.entity';
import { Toolkit, ToolkitType } from '@toolkits/toolkits.model';
import { UserScheduleSession } from 'src/schedule-sessions/entities/user-schedule-sessions.entity';
import { GraphQLInt } from 'graphql';
import { ScheduleReminder } from '@schedules/entities/schedule-reminder.entity';
import { HabitDay } from '@schedules/entities/habit-days.dto';
import { HabitTool } from '@schedules/entities/habit-tools.entity';
import { HabitToolDeletedFromAgenda } from '@schedules/entities/habit_tools_delete_from_agenda.entity';
import { UserAppointmentDetail } from './get-dashboard.dto';

@ArgsType()
export class GetUserCalenderAgendaArgs {
  @Field(() => String)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  @IsISO8601({ strict: true }) //TODO: add error message
  startDate: string;

  @Field(() => String)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  @IsISO8601({ strict: true })
  endDate: string;

  @Field(() => String)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  userId: string;
}

@ObjectType()
export class UserCalenderSchedule extends ScheduleEntity {
  @Field(() => String, { nullable: true })
  tool_kit_category?: string;

  @Field(() => ToolkitType, { nullable: true })
  tool_kit_type?: ToolkitType;

  @Field(() => String, { nullable: true })
  toolkit_id?: string;

  @Field(() => String, { nullable: true })
  tool_type_text?: string;

  @Field(() => String, { nullable: true })
  tool_description?: string;

  @Field(() => String, { nullable: true })
  toolkit_title?: string;

  @Field(() => GraphQLInt, { nullable: true })
  toolkit_hlp_points?: number;

  @Field(() => GraphQLInt)
  total_sessions: number;

  @Field(() => GraphQLInt)
  completed_sessions: number;

  @Field(() => String, { nullable: true })
  session_id?: string;

  @Field(() => String, { nullable: true })
  day_id?: string;

  @Field(() => String, { nullable: true })
  habit_id?: string;

  @Field(() => Int, { nullable: true })
  day?: number;

  @Field(() => String, { nullable: true })
  habit_name?: string;

  @Field(() => String, { nullable: true })
  habit_tool_id?: string;

  @Field(() => [ScheduleReminder], { nullable: 'items' })
  schedule_Reminders: ScheduleReminder[];

  @Field(() => UserAppointmentDetail, { nullable: true })
  user_appointment?: UserAppointmentDetail;

  @Field(() => [String], { nullable: true })
  form_session_ids?: string[];
}

@ObjectType()
export class CalenderAgenda {
  @Field(() => String)
  date: string;

  @Field(() => [UserCalenderSchedule], { nullable: 'items' })
  agenda: UserCalenderSchedule[];
}

@ObjectType()
export class GetUserCalenderAgendaResponse {
  @Field(() => [CalenderAgenda], { nullable: 'items' })
  calenderAgenda: CalenderAgenda[];
}

export class SchedulesWithSessions extends ScheduleEntity {
  toolkit?: Toolkit;
  total_sessions: number;
  sessions: UserScheduleSession[];
  reminders: ScheduleReminder[];
  day_id?: string;
  habit_id?: string;
  day?: number;
  habit_name?: string;
  habit_tool_id?: string;
}

export class DateWithSchedules {
  date: string;
  schedules: SchedulesWithSessions[];
}

export class HabitToolWithToolkit extends HabitTool {
  tool_kit: Toolkit;
}

export class HabitDaysWithTools extends HabitDay {
  habit_tools: HabitToolWithToolkit[];
}

export class HabitSchedulesWithSessions extends ScheduleEntity {
  toolkit?: Toolkit;
  total_sessions: number;
  sessions: UserScheduleSession[];
  reminders: ScheduleReminder[];
  habit_days_with_tools: HabitDaysWithTools[];
  habit_tools_deleted_from_agenda: HabitToolDeletedFromAgenda[];
}
