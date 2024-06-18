import { Type } from 'class-transformer';
import {
  Allow,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Schedule } from '../schedules/schedules.dto';

export class ScheduleSessionDto {
  user_id: string;
  session_date: string;
  tool_kit_id?: string;
  schedule_id: string;
  id?: string;
  created_at?: string;
  updated_at?: string;
  session_id: string;
  schedule?: Schedule;
  checkin_id?: string;
  challenge_id?: string;
  habit_tool_id?: string;
  user_toolkit_id?: string;
  user_appointment_id?: string;
}

export class EventDto<T> {
  @Allow()
  session_variables: SessionVariables;

  @Allow()
  op: string;

  @IsNotEmpty()
  @IsObject()
  @IsNotEmptyObject()
  data: T;

  @Allow()
  trace_context: TraceContext;
}

export class HasuraEventPayload<T> {
  @ValidateNested()
  @IsNotEmpty()
  @Type(() => EventDto)
  @IsObject()
  @IsNotEmptyObject()
  event: T;

  @Allow()
  created_at: string;

  @Allow()
  id: string;

  @Allow()
  delivery_info: DeliveryInfo;
  @Allow()
  trigger: Trigger;
  @Allow()
  table: Table;
}

export interface SessionVariables {
  'x-hasura-role': string;
}

export interface Data {
  old: BaseToolKit;
  new: BaseToolKit;
}

export class BaseToolKit {
  hlp_points_earned: string;
  session_date: string;
  note: string;
  tool_kit_id: string;
  check_in: string;
  doses: number;
  alcohol_type_id: string;
  updated_at: string;
  schedule_id: string;
  feeling: number;
  created_at: string;
  id: string;
  user_id: string;
  form_id: string;
  habit_id: string;
  episode_id: string;
  session_id: string;
}

export interface TraceContext {
  trace_id: string;
  span_id: string;
}

export interface DeliveryInfo {
  max_retries: number;
  current_retry: number;
}

export interface Trigger {
  name: string;
}

export interface Table {
  schema: string;
  name: string;
}

export interface GetToolKitSessionsCount {
  user_schedule_sessions_aggregate: UserScheduleSessionsAggregate;
}

export interface UserScheduleSessionsAggregate {
  aggregate: Aggregate;
}

export interface Aggregate {
  count: number;
}

/**
 * @description The @function addScheduleSessionTest()  functions in the schedule-sessions controller utilizes DTOs
 */
export class BaseToolKitAnswer {
  @IsUUID()
  session_id: string;

  @IsString()
  session_date: string;

  @IsOptional()
  @IsUUID()
  tool_kit_id?: string;

  @IsUUID()
  schedule_id: string;

  @IsUUID()
  user_id: string;

  hlp_points_earned: string;
  note: string;

  @Allow()
  doses: number;

  @Allow()
  alcohol_type_id: string;

  @Allow()
  updated_at: string;

  @Allow()
  id: string;

  @Allow()
  form_id: string;

  @Allow()
  habit_id: string;

  @Allow()
  episode_id: string;

  @Allow()
  episode_session_id?: string;

  @Allow()
  day_id?: string;

  //This is user_toolkit_id
  @IsOptional()
  @IsUUID()
  toolkit_id?: string;

  //from user_appointment_answers table
  @IsOptional()
  appointment_id?: string;

  //from user_form_answers table
  @IsOptional()
  user_appointment_id?: string;

  //from user_form_answers table
  @IsOptional()
  @IsUUID()
  appointment_session_id?: string;
}

export class MedicationPlan {
  id: string;
  user_id: string;
  tool_kit_id: string;
  medication: string;
  doses: number;
  stock: number;
  instructions: string;
  created_at: string;
  updated_at: string;
  schedule_id: string;
}
