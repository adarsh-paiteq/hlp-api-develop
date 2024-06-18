import { OmitType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsObject,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { ToolKit } from '../rewards/rewards.dto';
import { ScheduleSessionDto } from '../schedule-sessions/schedule-sessions.dto';
import { Schedule } from '../schedules/schedules.dto';
import { ToolkitType } from '../toolkits/toolkits.model';
import { ScheduleType } from '../schedules/entities/schedule.entity';

export class CheckinLevel {
  id: string;
  title: string;
  short_description: string;
  hlp_reward_points_to_complete_check_in: number;
  hlp_reward_points_to_be_awarded: number;
  sequence_number: string;
  created_at: string;
  updated_at: string;
  userCheckins: UserCheckinLevel[];

  //custom
  is_completed: boolean;
  progress_percentage: number;
}

export class UserCheckinLevel {
  id: string;
  user_id: string;
  check_in_level_id: string;
  created_at: string;
  updated_at: string;
}

export class ScheduleSession extends ScheduleSessionDto {
  check_in: Checkin;
}

export class Checkin {
  title: string;
  tool_kit: ToolKit;
  description: string;
  avatar: string;
  id: string;
  schedules: Schedule[];
  emoji_image_url: string;
  emoji_image_file_path: string;
  emoji_image_id: string;
}

export class UserCheckin {
  id: string;
  user_id: string;
  check_in: string;
  updated_at: string;
  created_at: string;
  checkInByCheckIn: Checkin;
}

export class GetCheckinsQueryDto {
  @IsDateString()
  date: string;
}

export class CheckinDto {
  id: string;
  tool_kit_id: string;
  tool_kit_category: string;
  tool_kit_type: string;
  title: string;
  description: string;
  avatar: string;
  total_sessions?: number;
  completed_sessions?: number;
  schedule_type?: ScheduleType;
  schedule_days?: string[];
  latestAnswer?: unknown;
  start_date?: string;
  schedule_id?: string;
  schedule_sessions?: ScheduleSessionDto[];
  answer?: unknown;
  goal_id: string;
  emoji_image_url: string;
  emoji_image_file_path: string;
  emoji_image_id: string;
  repeat_per_day?: number;
}

export const toolKitAnswerFields = new Map([
  ['drink_water_tool_kit_answers', 'session_time'],
  ['running_tool_kit_answers', 'session_time'],
  ['video_tool_kit_answers', 'session_time'],
  ['activity_tool_kit_answers', 'activity_time'],
  ['meditation_tool_kit_answers', 'meditation_time'],
  ['podcast_tool_kit_answers', 'session_time'],
  ['sleep_check_tool_kit_answers', 'quality_of_sleep,quality_of_sleep'],
  ['steps_tool_kit_answers', 'steps,feeling'],
  ['heart_rate_tool_kit_answers', 'average_heart_rate,feeling'],
  ['blood_pressure_tool_kit_answers', 'average_bp,feeling'],
  ['weight_intake_tool_kit_answers', 'weight,feeling'],
  ['medication_tool_kit_answers', 'doses,feeling'],
  ['ecg_tool_kit_answer', 'spm'],
  ['alcohol_intake_tool_kit_answers', 'doses'],
  ['sports_tool_kit_answers', 'duration'],
  ['audio_tool_kit_answers_table', 'consumed_duration'],
]);

export class CheckinLevelWithStatus extends OmitType(CheckinLevel, [
  'userCheckins',
]) {}

export class GetUserNextCheckinLevelParamsTest {
  @IsUUID()
  id: string;
}
export class GetUserNextCheckinLevelResponse {
  message: string;
  data?: UserCheckinLevel;
}

export class ScheduleWithSessionsAndAnswer extends Schedule {
  sessions: ScheduleSessionDto[];
  latest_answer: {
    [key: string]: unknown;
  };
  total_sessions: number;
  completed_sessions: number;
  answer: string;
  tool_kit_type: ToolkitType;
  tool_kit_category: string;
  goal_id: string;
  toolkit_unit: string;
}

export class GetUserCheckinsResponseDto {
  checkin_level: CheckinLevelWithStatus;
  checkins: CheckinDto[];
}

export class UserCheckinUpdate {
  @IsBoolean()
  @IsNotEmpty()
  is_check_in_disabled_by_user: boolean;
  created_at: string;
  updated_at: string;

  @IsNotEmpty()
  @IsUUID()
  check_in: string;
  id: string;

  @IsNotEmpty()
  @IsUUID()
  user_id: string;
}

export class DisableCheckinSchedulesBodyDto {
  @ValidateNested()
  @Type(() => UserCheckinUpdate)
  @IsObject()
  @IsNotEmpty()
  data: UserCheckinUpdate;
}
