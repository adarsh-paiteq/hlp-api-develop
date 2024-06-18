import { OmitType, PickType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  Allow,
  IsBoolean,
  IsDate,
  IsDateString,
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsString,
  IsUUID,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { BlogPost } from '../blog-posts/blogs-posts.model';
import { Checkin } from '../checkins/checkins.dto';
import {
  EventDto,
  HasuraEventPayload,
  ScheduleSessionDto,
} from '../schedule-sessions/schedule-sessions.dto';
import { Toolkit, ToolkitType } from '../toolkits/toolkits.model';
import { ToolkitTargetType } from '../utils/utils.dto';
import { ScheduleFor, ScheduleType } from './entities/schedule.entity';

export class Schedule {
  id: string;
  user: string;
  check_in: string;
  tool_kit?: string;
  schedule_for: ScheduleFor;
  schedule_type: ScheduleType;
  start_date: string;
  end_date?: string;
  show_reminder: boolean;
  repeat_per_day?: number;
  repeat_per_month: number[];
  schedule_days?: string[];
  created_at: string;
  updated_at: string;
  toolKitByToolKit: ToolKitByToolKit;
  checkInByCheckIn: CheckInByCheckIn;
  challenge?: Challenge;
  user_schedule_sessions: ScheduleSessionDto[];
  form_id: string;
  episode_id: string;
  schedule_reminders: Array<ScheduleReminder>;
  is_schedule_disabled: boolean;
  sports_tool_kit_option_selected_by_users?: ToolKitUserOption[];
  alcohol_tool_kit_option_selected_by_users?: ToolKitUserOption[];
  step_tool_kit_option_selected_by_users?: ToolKitUserOption[];
  weight_tool_kit_option_selected_by_users?: ToolKitUserOption[];
  sleep_tool_kit_option_selected_by_users?: ToolKitUserOption[];
  medication_tool_kit_info_planned_by_users?: ToolKitUserOption[];
  challenge_id: string;

  [key: string]: unknown;
  user_toolkit_id?: string;
  user_toolkit_title?: string;
}

export class Unit {
  unit: string;
}

export class ToolKitByToolKit extends OmitType(Toolkit, ['tool_kit_type']) {
  id: string;
  short_description: string;
  image_url: string;
  image_id: string;
  file_path: string;
  title: string;
  tool_kit_type: ToolkitType;
  tool_kit_category: string;
  tool_kit_hlp_reward_points: number;
  goal_id: string;
  tool_kit_result_screen_image: string;
  unitByUnit: Unit;
}
export class GoalDto {
  id: string;
  title: string;
  description: string;
  avatar: string;
  age_group: string;
  created_at: string;
  updated_at: string;
}
export class GoalLevelDto {
  id: string;
  title: string;
  short_description: string;
  goal_id: string;
  user_goal_levels: UserGoalLevelDto[];
  is_completed?: boolean;
  hlp_reward_points_to_complete_goal: number;
  hlp_reward_points_to_be_awarded: number;
  sequence_number: number;
  created_at: string;
  updated_at: string;
}
export class UserGoalLevelDto {
  id: string;
  user_id: string;
  goal_level_id: string;
  created_at: string;
  updated_at: string;
}
export class MapToolkitWithPointsAndTimesPerformedDto {
  toolkitId: string;
  pointsForEachTimePerformed: number;
  timesPerformed: number;
  totalPoints: number;
}

export class ToolkitResultDto {
  gif: string;
  toolkit: string;
  points: number;
  goal_level: string;
  goal_name: string;
  weekly_targets?: number;
  completed_targets?: number;
}
export interface ToolKitUserOption {
  id: string;
}
export type CheckInByCheckIn = Omit<Checkin, 'schedules'>;

export interface Blogs {
  id: string;
  title: string;
  short_description: string;
  image_url: string;
  image_id: string;
  file_path: string;
  blog_type: string;
  tool_kit: string;
  toolKitByToolKit: ToolKitByToolKit;
  avatar: string;
  age_group: string;
  show_order: number;
}

export interface ServiceOffers {
  id: string;
  title: string;
  short_description: string;
  image_url: string;
  image_id: string;
  file_path: string;
}

export class ScheduleReminder {
  @IsNotEmpty()
  is_reminder_disabled: boolean;
  @IsNotEmpty()
  created_at: string;
  @IsNotEmpty()
  updated_at: string;

  @IsNotEmpty()
  @IsISO8601({ strict: true })
  reminder_time: string;
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  schedule_id: string;
  @IsNotEmpty()
  user_id: string;
}

export class ScheduleReminderEventData {
  old: ScheduleReminder;
  new: ScheduleReminder;
}

export class ScheduleReminderEvent extends HasuraEventPayload<
  EventDto<ScheduleReminderEventData>
> {}

export class UpdateScheduleReminder extends ScheduleReminder {
  @IsUUID()
  id: string;

  @IsBoolean()
  is_reminder_disabled: boolean;

  @IsString()
  reminder_time: string;

  @IsUUID()
  schedule_id: string;

  @Allow()
  created_at: string;

  @Allow()
  updated_at: string;
}

export enum WeekDay {
  'SA' = 'SAT',
}

export class ScheduleDto {
  @Allow()
  @IsUUID()
  id: string;

  @IsUUID()
  user: string;

  @ValidateIf((obj: ScheduleDto) => obj.schedule_for === ScheduleFor.CHECK_IN)
  @IsUUID()
  @IsNotEmpty()
  check_in: string;

  @ValidateIf((obj: ScheduleDto) => obj.schedule_for === ScheduleFor.TOOL_KIT)
  @IsUUID()
  @IsNotEmpty()
  tool_kit: string;

  @IsEnum(ScheduleFor)
  @IsNotEmpty()
  schedule_for: ScheduleFor;

  @IsEnum(ScheduleType)
  @IsNotEmpty()
  schedule_type: ScheduleType;

  @IsDate({})
  start_date: string;

  @IsBoolean()
  show_reminder: boolean;

  @IsNumber()
  repeat_per_day: number;

  @IsString({ each: true })
  @ValidateIf((obj: ScheduleDto) => obj.schedule_type === ScheduleType.WEEKLY)
  schedule_days: string[] | undefined;

  @IsNumber({}, { each: true })
  @ValidateIf((obj: ScheduleDto) => obj.schedule_type === ScheduleType.MONTHLY)
  repeat_per_month: number[];

  @IsBoolean()
  is_schedule_disabled: boolean;

  //   @ValidateIf((obj: ScheduleDto) => obj.schedule_for === ScheduleFor.CHECK_IN)
  //   @IsUUID()
  //   @IsNotEmpty()
  //   challenge_id: string;

  @ValidateIf((obj: ScheduleDto) => obj.show_reminder)
  @ValidateNested({ each: true })
  @Type(() => ReminderDto)
  reminders: ReminderDto[];

  @IsEnum(ToolkitType)
  @IsNotEmpty()
  toolkit_type: ToolkitType;

  @ValidateIf((obj: ScheduleDto) => obj.toolkit_type === ToolkitType.SPORT)
  @ValidateNested({ each: true })
  @Type(() => SportToolkitOption)
  sports_toolkit_options: SportToolkitOption[];

  @ValidateIf(
    (obj: ScheduleDto) => obj.toolkit_type === ToolkitType.ALCOHOL_INTAKE,
  )
  @ValidateNested({ each: true })
  @Type(() => AlcoholToolkitOption)
  alcohol_toolkit_options: AlcoholToolkitOption[];

  @ValidateIf(
    (obj: ScheduleDto) => obj.toolkit_type === ToolkitType.SLEEP_CHECK,
  )
  @ValidateNested({ each: true })
  @Type(() => SleepToolkitOption)
  sleep_toolkit_options: SleepToolkitOption[];

  @ValidateIf((obj: ScheduleDto) => obj.toolkit_type === ToolkitType.STEPS)
  @ValidateNested({ each: true })
  @Type(() => StepToolkitOption)
  step_toolkit_options: StepToolkitOption[];

  @ValidateIf((obj: ScheduleDto) => obj.toolkit_type === ToolkitType.WEIGHT)
  @ValidateNested({ each: true })
  @Type(() => WeightToolkitOption)
  weight_toolkit_options: WeightToolkitOption[];

  @ValidateIf(
    (obj: ScheduleDto) => obj.toolkit_type === ToolkitType.SLEEP_CHECK,
  )
  @ValidateNested({ each: true })
  @Type(() => MedicationToolkitOption)
  medication_toolkit_options: MedicationToolkitOption[];
}

export class ReminderDto {
  @Allow()
  @IsBoolean()
  is_reminder_disabled: boolean;

  @Allow()
  created_at: string;

  @Allow()
  updated_at: string;

  @IsString()
  @IsNotEmpty()
  reminder_time: string;

  @Allow()
  @IsUUID()
  id: string;

  @IsUUID()
  @IsNotEmpty()
  schedule_id: string;
}

export class ToolkitBaseOptions {
  @IsUUID()
  @IsNotEmpty()
  user_id: string;

  @IsUUID()
  @IsNotEmpty()
  tool_kit_id: string;

  @IsUUID()
  @IsNotEmpty()
  schedule_id: string;
}

export class SportToolkitOption extends ToolkitBaseOptions {
  @IsUUID()
  @IsNotEmpty()
  steps_tool_kit_option_id: string;
}

export class AlcoholToolkitOption extends ToolkitBaseOptions {
  @IsUUID()
  @IsNotEmpty()
  alcohol_tool_kit_option_id: string;
}

export class SleepToolkitOption extends ToolkitBaseOptions {
  @IsUUID()
  @IsNotEmpty()
  sleep_tool_kit_option_id: string;
}

export class WeightToolkitOption extends ToolkitBaseOptions {
  @IsNumber()
  @IsNotEmpty()
  weight: number;
}

export class StepToolkitOption extends ToolkitBaseOptions {
  @IsUUID()
  @IsNotEmpty()
  steps_tool_kit_option_id: string;
}

export class MedicationToolkitOption extends ToolkitBaseOptions {
  @IsString()
  @IsNotEmpty()
  medication: string;

  @IsNumber()
  @IsNotEmpty()
  doses: number;

  @IsNotEmpty()
  @IsNumber()
  stock: number;

  @IsString()
  @IsNotEmpty()
  instructions: string;
}

export class Challenge {
  id: string;
  title: string;
  label: string;
  emoji: string;
  short_description: string;
  description: string;
  image_id: string;
  image_url: string;
  file_path: string;
  challenge_start_date: string;
  challenge_end_date: string;
  total_days: number;
  is_challenge_completed: boolean;
  hlp_reward_points_required_for_completing_goal: number;
  hlp_reward_points_required_for_winning_challenge: number;
  hlp_reward_points_to_be_awarded_for_completing_goal: number;
  hlp_reward_points_to_be_awarded_for_winning_challenge: number;
  created_at: string;
  updated_at: string;
  tool_kit_id: string;
  tool_kit: ToolKitByToolKit;
}

export class DashboardChallenge extends PickType(Challenge, [
  'id',
  'title',
  'image_url',
  'tool_kit_id',
  'short_description',
  'created_at',
  'file_path',
]) {
  tool_kit_type: ToolkitType;
  tool_kit_category: string;
}

/**
 * @deprecated The @function getToolkitResult()  functions in the schedules controller use DTOs
 */
export class GetToolkitResultParam {
  @IsUUID()
  id: string;
}

export class GetToolkitResultResponse {
  gif?: string;
  hlp_points: number;
  goal_level: string | undefined;
  goal_name: string | undefined;
  targetTotal: number;
  targetType: ToolkitTargetType;
  completed: number;
  title: string;
}

/**
 * @deprecated The @function getToolkitResult()  functions in the schedules controller use DTOs
 */
export class GetToolkitResultQuery {
  @IsDateString()
  date: string;
}

export class ScheduleReminderDto extends OmitType(ScheduleReminder, [
  'id',
  'created_at',
  'updated_at',
  'is_reminder_disabled',
]) {}

export interface ScheduleRemindersData {
  schedule: Schedule;
  reminders: ScheduleReminder[];
}

export interface ReminderBulkJobs {
  name: string;
  data: ScheduleReminder;
  opts: { jobId: string; delay: number };
}

export enum BlogType {
  DAILY_BOOST = 'DAILY_BOOST',
}

export class DashboardBlog extends BlogPost {
  is_read: boolean;
}

/**
 * @description The @function addReminder()  functions in the schedules controller use DTOs
 */
export class AddReminderBodyDto {
  @IsObject()
  @ValidateNested()
  @Type(() => ScheduleReminder)
  data: ScheduleReminder;
}

// type ScheduleWithToolkit = Omit<Schedule, 'tool_kit'> & { took_kit: Toolkit };

export class ScheduleWithToolkit extends Schedule {
  toolkit: Toolkit;
}
