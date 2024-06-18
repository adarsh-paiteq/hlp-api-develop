import {
  ScheduleFor,
  ScheduleType,
} from '../schedules/entities/schedule.entity';
import { Goal } from '../goals/entities/goal.entity';
import { Schedule } from '../schedules/schedules.model';
import {
  GraphRange,
  GraphType,
  Toolkit,
  ToolkitAnswers,
  ToolkitType,
} from './toolkits.model';

/**
 *@description DTO used in MeditationToolkitDataDto used in trophies listener
 */
export class MeditationToolkitTypeDto {
  id: string;
  title: string;
  tool_kit_type: ToolkitType;
  tool_kit_hlp_reward_points: number;
}

/**
 *@deprecated DTO used in SportToolkitDataDto and  ToolkitData DTO
 */
export class SportToolkitTypeDto extends MeditationToolkitTypeDto {
  short_description: string;
}

/**
 *@deprecated DTO used in ActivityToolkitDataDto and  ToolkitData DTO
 */
export class ActivityToolkitTypeDto extends MeditationToolkitTypeDto {
  activity_timer_value: number;
}

/**
 *@deprecated DTO used in WeightToolkitDataDto and  ToolkitData DTO
 */
export class WeightToolkitTypeDto extends MeditationToolkitTypeDto {
  max_weight_value: number;
}

/**
 *@deprecated DTO used in StepsToolkitDataDto and  ToolkitData DTO
 */
export class StepsToolkitTypeDto extends SportToolkitTypeDto {
  image_url: string;
  max_foot_steps: number;
}

/**
 *@deprecated DTO used in MedicationToollkitDataDto,RunningToolkitDataDto and  ToolkitData DTO
 */
export class RunningToolkitTypeDto extends SportToolkitTypeDto {
  tool_kit_info: string;
  description: string;
}

/**
 *@deprecated DTO used in PodcastToolkitDataDto and  ToolkitData DTO
 */
export class PodcastToolkitTypeDto extends MeditationToolkitTypeDto {}

/**
 *@deprecated DTO used in VideoToolkitDataDto and  ToolkitData DTO
 */
export class VideoToolkitTypeDto extends MeditationToolkitTypeDto {}

/**
 *@deprecated DTO used in  ToolkitData DTO
 */
export class MedicationToolkitTypeDto extends MeditationToolkitTypeDto {
  max_medication_per_day_value: number;
}

/**
 *@deprecated DTO used in HeartEcgToolkitDataDto and ToolkitData DTO
 */
export class HeartEcgToolkitTypeDto extends MeditationToolkitTypeDto {
  max_ecg_spm_value: number;
}

/**
 *@deprecated DTO used in AlcoholToolkitDataDto and ToolkitData DTO
 */
export class AlcoholToolkitTypeDto extends SportToolkitTypeDto {
  image_url: string;
  max_alcohol_intake: number;
}

/**
 *@deprecated DTO used in BloodToolkitDataDto and ToolkitData DTO
 */
export class BloodPressureToolkitTypeDto extends MeditationToolkitTypeDto {
  max_blood_diastolic_value: number;
  max_blood_systolic_value: number;
}

/**
 *@deprecated DTO used in HeartRateToolkitDataDto and ToolkitData DTO
 */
export class HeartRateToolkitTypeDto extends MeditationToolkitTypeDto {
  max_heart_rate_in_bpm: string;
}

/**
 *@deprecated DTO used in SleepToolkitDataDto and ToolkitData DTO
 */
export class SleepCheckToolkitTypeDto extends SportToolkitTypeDto {
  challanges: { id: string };
}

/**
 *@deprecated DTO used in SleepToolkitDataDto and ToolkitData DTO
 */
export class SleepGoalDto {
  id: string;
  sleep_tool_kit_option: SleepOptionsDto;
}

/**
 *@deprecated DTO used in SleepGoalDto,SleepToolkitDataDto and ToolkitData DTO
 */
export class SleepOptionsDto {
  id: string;
  sleep_time: string;
  tool_kit_id: string;
}

/**
 *@deprecated DTO used in AlcoholToolkitDataDto and ToolkitData DTO
 */
export class AlcoholGoalDto {
  id: string;
  alcohol_tool_kit_option: AlcoholOptionsDto;
}

/**
 *@deprecated  DTO used in AlcoholGoalDto,AlcoholToolkitDataDto and ToolkitData DTO
 */
export class AlcoholOptionsDto {
  id: string;
  no_of_glasses: number;
}

/**
 * @deprecated Unused Code
 */
export class AlcoholTypeDto {
  emoji: string;
  id: string;
  title: string;
}

/**
 * @deprecated Unused Code
 */
export class ScheduleDataDto {
  id: string;
  schedule_type: ScheduleType;
  repeat_per_day: number;
  show_reminder: boolean;
  repeat_per_month: number[];
  start_date: string;
  schedule_for: ScheduleFor;
  schedule_days: string[];
  schedule_reminder: { id: string; reminder_time: string };
}

/**
 *@deprecated DTO used in MedicationToollkitDataDto and ToolkitData DTO
 */
export class MedicationGoalDto {
  medication_tool_kit_info_planned_by_user: MedicationToolkitInfoPlannedByUserDto;
}

/**
 *@deprecated DTO used in  MedicationGoalDto
 */
export class MedicationToolkitInfoPlannedByUserDto {
  doses: string;
  id: string;
  instructions: string;
  stock: string;
  tool_kit_id: string;
  user_id: string;
  schedule_id: string;
}

/**
 * @deprecated Unused Code
 */
export class ActivityTypeDto {
  activities: { id: string; title: string };
}

/**
 * @deprecated Unused Code
 */
export class IntensityTypeDto {
  intensities: { id: string; title: string };
}

/**
 *@deprecated   DTO used in ToolkitData
 */
export class SportGoalDto {
  id: string;
  sports_tool_kit_option: SportOptionsDto;
}

/**
 *@deprecated   DTO used in SportGoalDto and ToolkitData
 */
export class SportOptionsDto {
  id: string;
  time_spent: number;
}

/**
 *@deprecated   DTO used in StepsToolkitDataDto and ToolkitData DTO
 */
export class StepsGoalDto {
  steps_tool_kit_options: StepsOptionsDto;
}

/**
 *@deprecated DTO used in StepsGoalDto
 */
export class StepsOptionsDto {
  id: string;
  steps: string;
}

/**
 *@deprecated DTO used in WeightToolkitDataDto and ToolkitData DTO
 */
export class WeightGoalDto {
  id: string;
  weight: string;
  weight_tool_kit_options: WeightOptionsDto;
}

/**
 *@deprecated DTO used in WeightGoalDto,WeightToolkitDataDto and ToolkitData DTO
 */
export class WeightOptionsDto {
  id: string;
  maximum_angle: string;
  starting_angle: string;
  tool_kit_id: string;
}

/**
 *@deprecated  Unused DTO
 */
export class MedicationToollkitDataDto {
  medication_tool_kit: RunningToolkitTypeDto[];
  medication_tool_kit_option_selected_by_user: MedicationGoalDto[];
}

/**
 *@deprecated  Unused DTO
 */
export class AlcoholToolkitDataDto {
  alcohol_tool_kit: AlcoholToolkitTypeDto[];
  alcohol_tool_kit_options: AlcoholOptionsDto[];
  alcohol_tool_kit_option_selected_by_user: AlcoholGoalDto[];
}

/**
 *@deprecated  Unused DTO
 */
export class SportToolkitDataDto {
  sport_tool_kit: SportToolkitTypeDto[];
  sport_tool_kit_options: SportOptionsDto[];
  sport_tool_kit_option_selected_by_user: SportGoalDto[];
}

/**
 *@deprecated  Unused DTO
 */
export class StepsToolkitDataDto {
  steps_tool_kit: StepsToolkitTypeDto[];
  steps_tool_kit_options: StepsOptionsDto[];
  step_tool_kit_option_selected_by_user: StepsGoalDto[];
}

/**
 * @deprecated Unused Code
 */
export class SleepToolkitDataDto {
  sleep_tool_kit: SleepCheckToolkitTypeDto[];
  sleep_tool_kit_options: SleepOptionsDto[];
  sleep_tool_kit_option_selected_by_user: SleepGoalDto[];
}

/**
 * @deprecated Unused Code
 */
export class WeightToolkitDataDto {
  weight_tool_kit: WeightToolkitTypeDto[];
  weight_tool_kit_options: WeightOptionsDto[];
  weight_tool_kit_option_selected_by_user: WeightGoalDto[];
}

/**
 * @deprecated Unused Code
 */
export class BloodToolkitDataDto {
  blood_pressure_tool_kit: BloodPressureToolkitTypeDto[];
}

/**
 * @deprecated Unused Code
 */
export class HeartRateToolkitDataDto {
  heart_rate_tool_kit: HeartRateToolkitTypeDto[];
}

/**
 * @deprecated Unused Code
 */
export class HeartEcgToolkitDataDto {
  heart_ecg_tool_kit: HeartEcgToolkitTypeDto[];
}

/**
 * @deprecated Unused Code
 */
export class PodcastToolkitDataDto {
  podcast_tool_kit: PodcastToolkitTypeDto[];
}

/**
 * @deprecated Unused Code
 */
export class ActivityToolkitDataDto {
  activity_tool_kit: ActivityToolkitTypeDto[];
}

/**
 * @deprecated Unused Code
 */
export class MeditationToolkitDataDto {
  meditation_tool_kit: MeditationToolkitTypeDto[];
}

/**
 * @deprecated Unused Code
 */
export class VideoToolkitDataDto {
  video_tool_kit: VideoToolkitTypeDto[];
}

/**
 * @deprecated Unused DTO
 */
export class RunningToolkitDataDto {
  running_tool_kit: RunningToolkitTypeDto[];
}

/**
 *@deprecated DTO used in @function getRemainingToolkitDataForCheckIfUserHasJoinedChallange()
 * this function used in CheckIfUserHasJoinedChallenge Action
 *  which is not used from app side
 * In app side they are using  getTookitDetails resolver
 */
export class ToolkitData {
  medication_tool_kit?: MedicationToolkitTypeDto[];
  medication_tool_kit_option_selected_by_user?: MedicationGoalDto[];
  alcohol_tool_kit?: AlcoholToolkitTypeDto[];
  alcohol_tool_kit_options?: AlcoholOptionsDto[];
  alcohol_tool_kit_option_selected_by_user?: AlcoholGoalDto[];
  sports_tool_kit?: SportToolkitTypeDto[];
  sports_tool_kit_options?: SportOptionsDto[];
  sports_tool_kit_option_selected_by_user?: SportGoalDto[];
  steps_tool_kit?: StepsToolkitTypeDto[];
  steps_tool_kit_options?: StepsOptionsDto[];
  step_tool_kit_option_selected_by_user?: StepsGoalDto[];
  sleep_tool_kit?: SleepCheckToolkitTypeDto[];
  sleep_tool_kit_options?: SleepOptionsDto[];
  sleep_tool_kit_option_selected_by_user?: SleepGoalDto[];
  weight_tool_kit?: WeightToolkitTypeDto[];
  weight_tool_kit_options?: WeightOptionsDto[];
  weight_tool_kit_option_selected_by_user?: WeightGoalDto[];
  blood_pressure_tool_kit?: BloodPressureToolkitTypeDto[];
  heart_rate_tool_kit?: HeartRateToolkitTypeDto[];
  heart_ecg_tool_kit?: HeartEcgToolkitTypeDto[];
  podcast_tool_kit?: PodcastToolkitTypeDto[];
  activity_tool_kit?: ActivityToolkitTypeDto[];
  meditation_tool_kit?: MeditationToolkitTypeDto[];
  video_tool_kit?: VideoToolkitTypeDto[];
  running_tool_kit?: RunningToolkitTypeDto[];
}

export const graphToolkitTypes = [
  ToolkitType.WEIGHT,
  ToolkitType.STEPS,
  ToolkitType.SPORT,
  ToolkitType.SLEEP_CHECK,
  ToolkitType.ALCOHOL_INTAKE,
  ToolkitType.ECG,
  ToolkitType.HEART_RATE,
  ToolkitType.BLOOD_PRESSURE,
  ToolkitType.VITALS,
];

export const toolkitGraphType = new Map<string, string>([
  [ToolkitType.WEIGHT, GraphType.BAR],
  [ToolkitType.STEPS, GraphType.BAR],
  [ToolkitType.SPORT, GraphType.BAR],
  [ToolkitType.SLEEP_CHECK, GraphType.BAR],
  [ToolkitType.ALCOHOL_INTAKE, GraphType.BAR],
  [ToolkitType.ECG, GraphType.RANGE],
  [ToolkitType.HEART_RATE, GraphType.RANGE],
  [ToolkitType.BLOOD_PRESSURE, GraphType.RANGE],
  [ToolkitType.VITALS, GraphType.RANGE],
]);

export const toolkitGraphFields = new Map<string, string>([
  [ToolkitType.WEIGHT, 'weight'],
  [ToolkitType.STEPS, 'steps'],
  [ToolkitType.SPORT, 'duration'],
  [ToolkitType.SLEEP_CHECK, 'total_sleep_time'],
  [ToolkitType.ALCOHOL_INTAKE, 'doses'],
  [ToolkitType.ECG, 'spm'],
  [ToolkitType.HEART_RATE, 'average_heart_rate'],
  [ToolkitType.BLOOD_PRESSURE, 'average_bp'],
  [ToolkitType.VITALS, `pulse`],
]);

export const toolkitRangeGraphMinFields = new Map<string, string>([
  [ToolkitType.ECG, 'spm'],
  [ToolkitType.HEART_RATE, 'average_heart_rate'],
  [ToolkitType.BLOOD_PRESSURE, 'lowest_bp'],
  [ToolkitType.VITALS, `diastolic_value`],
]);

export const toolkitRangeGraphMaxFields = new Map<string, string>([
  [ToolkitType.ECG, 'spm'],
  [ToolkitType.HEART_RATE, 'average_heart_rate'],
  [ToolkitType.BLOOD_PRESSURE, 'highest_bp'],
  [ToolkitType.VITALS, `systolic_value`],
]);

export const toolkitDatePartFields = new Map<string, string>([
  [GraphRange.DAY, 'hour'],
  [GraphRange.WEEK, 'dow'],
  [GraphRange.MONTH, 'day'],
  [GraphRange.YEAR, 'month'],
]);

export const toolkitSessionFields = new Map<string, string>([
  [GraphRange.DAY, 'session_time'],
  [GraphRange.WEEK, 'session_date'],
  [GraphRange.MONTH, 'session_date'],
  [GraphRange.YEAR, 'session_date'],
]);

export const weekDays = [
  'short_mon',
  'short_tu',
  'short_we',
  'short_th',
  'short_fr',
  'short_sa',
  'short_su',
];

export const yearMonths = [
  'short_jan',
  'short_feb',
  'short_mar',
  'short_apr',
  'short_may',
  'short_jun',
  'short_jul',
  'short_aug',
  'short_sep',
  'short_oct',
  'short_nov',
  'short_dec',
];

export const dayHours = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '20',
  '21',
  '22',
  '23',
  '24',
];

export const toolKitOptionTables = new Map([
  ['SLEEP_CHECK', 'sleep_tool_kit_options'],
  ['WEIGHT', 'weight_tool_kit_options'],
  ['ALCOHOL_INTAKE', 'alcohol_tool_kit_options'],
  ['SPORT', 'sports_tool_kit_options'],
  ['STEPS', 'steps_tool_kit_options'],
  [ToolkitType.AUDIO, 'audio_tool_kit_files'],
]);

/**
 * @deprecated toolkitSelectedOptionFragments  is used in getToolkitOptionsSelectedQuery repo and this repo is not used in anywhere
 */
export const toolkitSelectedOptionFragments = new Map([
  [
    'medication_tool_kit_info_planned_by_user',
    'medication_tool_kit_info_planned',
  ],
  ['sleep_tool_kit_option_selected_by_user', 'sleep_tool_kit_option_selected'],
  [
    'alcohol_tool_kit_option_selected_by_user',
    'alcohol_tool_kit_option_selected',
  ],
  [
    'sports_tool_kit_option_selected_by_user',
    'sports_tool_kit_option_selected',
  ],
  ['step_tool_kit_option_selected_by_user', 'step_tool_kit_option_selected'],
  [
    'weight_tool_kit_option_selected_by_user',
    'weight_tool_kit_option_selected',
  ],
]);

export class PepareGraphData {
  userId: string;
  startDate: string;
  endDate: string;
  graphRange: GraphRange;
  toolkitType: ToolkitType;
}

export class GraphQueryResponse {
  total?: number;
  start?: number;
  end?: number;
  label: string;
}

export class ToolkitAnswerAndSchedule {
  answer: ToolkitAnswers[];
  schedule: Schedule[];
}

export class ToolkitAndGoal {
  toolkit: Toolkit[];
  goal: Goal[];
}
