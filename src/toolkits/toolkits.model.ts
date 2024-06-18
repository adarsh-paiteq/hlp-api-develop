import {
  ArgsType,
  createUnionType,
  Field,
  GraphQLISODateTime,
  HideField,
  InputType,
  ObjectType,
  PickType,
  registerEnumType,
} from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';
import { GraphQLFloat, GraphQLInt } from 'graphql';
import { Challenge } from '../challenges/challenges.model';
import { VitalsToolkitAnswer } from './entities/vitals-toolkit-answer.entity';
import { MoodCheckCategory } from '../user-mood-checks/entities/mood-check-category.entity';
import { MoodCheckSubCategory } from '../user-mood-checks/entities/mood-check-sub-category.entity';
import { MoodToolkitAnswer } from './entities/mood-toolkit-answer.entity';
import { AudioToolkitFileWithStatus } from './dto/get-audio-toolkit-details.dto';
import { AudioToolKitFile } from './entities/audio-toolkit-files.entity';
import { AudioToolkitAnswer } from './entities/audio-toolkit-answer.entity';
import { PlayedAudioToolkitAudioFile } from './entities/played-audio-toolkit-audio-file.entity';
import { i18nValidationMessage } from '@core/modules/i18n-next';
import { Translation } from '@utils/utils.dto';
import { AddictionLogToolkitAnswer } from './entities/addiction-log-toolkit-answer.entity';
import { SymptomsLogToolkitAnswer } from './entities/symptoms-log-toolkit-answer.entity';
import { SuspiciusSymptomsLogToolkitAnswer } from './entities/suspicius-symptoms-log-toolkit-answer.entity';
import { AnxietySymptomsLogToolkitAnswer } from './entities/anxiety-symptoms-log-toolkit-answer.entity';
import { EmotionSymptomsLogToolkitAnswer } from './entities/emotion-symptoms-log-toolkit-answer.entity';
import { HyperActivitySymptomsLogToolkitAnswer } from './entities/hyper-activity-symptoms-log-toolkit-answer.entity';
import { ForcedActionSymptomsLogToolkitAnswer } from './entities/forced-action-symptoms-log-toolkit-answer.entity';

export enum ToolkitType {
  DRINK_WATER = 'DRINK_WATER',
  RUNNING = 'RUNNING',
  VIDEO = 'VIDEO',
  ACTIVITY = 'ACTIVITY',
  MEDITATION = 'MEDITATION',
  PODCAST = 'PODCAST',
  SLEEP_CHECK = 'SLEEP_CHECK',
  STEPS = 'STEPS',
  HEART_RATE = 'HEART_RATE',
  BLOOD_PRESSURE = 'BLOOD_PRESSURE',
  WEIGHT = 'WEIGHT',
  MEDICATION = 'MEDICATION',
  ECG = 'ECG',
  FORM = 'FORM',
  EPISODES = 'EPISODES',
  ALCOHOL_INTAKE = 'ALCOHOL_INTAKE',
  SPORT = 'SPORT',
  HABIT = 'HABIT',
  AUDIO = 'AUDIO',
  VITALS = 'VITALS',
  MOOD = 'MOOD',
  BLOG = 'BLOG',
  SYMPTOMS_LOG = 'SYMPTOMS_LOG',
  ADDICTION_LOG = 'ADDICTION_LOG',
  EMOTION_SYMPTOMS_LOG = 'EMOTION_SYMPTOMS_LOG',
  FORCED_ACTION_SYMPTOMS_LOG = 'FORCED_ACTION_SYMPTOMS_LOG',
  ANXIETY_SYMPTOMS_LOG = 'ANXIETY_SYMPTOMS_LOG',
  SUSPICIUS_SYMPTOMS_LOG = 'SUSPICIUS_SYMPTOMS_LOG',
  HYPER_ACTIVITY_SYMPTOMS_LOG = 'HYPER_ACTIVITY_SYMPTOMS_LOG',
}

export enum EpisodeType {
  VIDEOS = 'VIDEOS',
  FORMS = 'FORMS',
}

registerEnumType(ToolkitType, { name: 'tool_kit_types_enum' });
registerEnumType(EpisodeType, { name: 'episode_Tool_types' });

export class ToolkitLanguageTranslation {
  title: string;
  description: string;
  tool_kit_info: string;
  tool_type_text: string;
  tool_description: string;
  short_description: string;
  extra_information_title: string;
  todo_screen_description: string;
  extra_information_description: string;
}

export class ToolkitTranslation {
  en: ToolkitLanguageTranslation;
  nl: ToolkitLanguageTranslation;
}

@ObjectType()
export class Toolkit {
  is_whats_new_tool_kit?: boolean;
  status?: boolean;
  habit_duration?: number;
  max_alcohol_intake?: number;
  max_blood_diastolic_value?: number;
  max_blood_systolic_value?: number;
  max_medication_per_day_value?: number;
  time_spent_on_sports?: number;

  @Field(() => GraphQLInt)
  tool_kit_hlp_reward_points: number;
  activity_timer_value?: number;
  max_ecg_spm_value?: number;
  max_foot_steps?: number;
  max_heart_rate_in_bpm?: number;
  max_weight_value?: number;
  meditation_timer_value?: number;
  podcast_audio_length?: number;
  sleep_check_max_value?: number;
  description: string;
  extra_information_description?: string;
  extra_information_title?: string;
  file_path: string;
  image_id: string;
  image_url: string;
  membership_stage_type: string;
  podcast_audio_url?: string;
  short_description: string;
  title: string;
  todo_screen_description: string;
  tool_kit_explain_page_file_path: string;
  tool_kit_explain_page_image_id: string;
  tool_kit_explain_page_image_url: string;
  tool_kit_info: string;
  tool_kit_profile_page_file_path: string;
  tool_kit_profile_page_image_id: string;
  tool_kit_profile_page_image_url: string;
  tool_kit_result_screen_image?: string;
  tool_kit_result_screen_image_file_path?: string;
  tool_kit_result_screen_image_id?: string;
  @Field(() => ToolkitType)
  tool_kit_type: ToolkitType;
  video_id?: string;
  video_path?: string;
  video_thumb_nail: string;
  video_thumbnail_id?: string;
  video_thumbnail_path?: string;
  video_url: string;
  created_at: string;
  updated_at: string;
  goal_id: string;
  id: string;
  membership_level_id: string;
  membership_stage_id?: string;
  tool_kit_category: string;
  tool_kit_sub_category: string;
  unit: string;
  tool_type_text: string;
  tool_description: string;
  episode_type?: EpisodeType;
  @HideField()
  translations?: Translation;
  symptoms_log_question?: string;
  addiction_log_question?: string;
}

@ObjectType()
export class SleepToolkitOptionSelectedByUser {
  created_at: string;
  updated_at: string;
  id: string;
  schedule_id: string;
  sleep_tool_kit_option_id: string;
  tool_kit_id: string;
  user_id: string;
}

@ObjectType()
export class SleepToolkitOption {
  sleep_time: string;
  created_at: string;
  updated_at: string;
  id: string;
  tool_kit_id: string;
}

@ObjectType()
export class MedicationToolkitInfoPlannedByUser {
  doses: number;
  stock: number;
  instructions: string;
  medication: string;
  created_at: string;
  updated_at: string;
  id: string;
  schedule_id: string;
  tool_kit_id: string;
  user_id: string;
}

@ObjectType()
export class WeightToolkitOption {
  maximum_angle: number;
  starting_angle: number;
  created_at: string;
  updated_at: string;
  id: string;
  tool_kit_id: string;
}

@ObjectType()
export class WeightToolkitOptionSelectedByUser {
  weight: number;
  created_at: string;
  updated_at: string;
  id: string;
  schedule_id: string;
  tool_kit_id: string;
  user_id: string;
}

@ObjectType()
export class StepsToolkitOption {
  steps: number;
  created_at: string;
  updated_at: string;
  id: string;
  tool_kit_id: string;
}

@ObjectType()
export class SportsToolkitOption {
  time_spent: number;
  created_at: string;
  updated_at: string;
  id: string;
  tool_kit_id: string;
}

@ObjectType()
export class AlcoholToolkitOption {
  no_of_glasses: number;
  created_at: string;
  updated_at: string;
  id: string;
  tool_kit_id: string;
}

@ObjectType()
export class StepToolkitOptionSelectedByUser {
  created_at: string;
  updated_at: string;
  id: string;
  schedule_id: string;
  steps_tool_kit_option_id: string;
  tool_kit_id: string;
  user_id: string;
}

@ObjectType()
export class SportsToolkitOptionSelectedByUser {
  created_at: string;
  updated_at: string;
  id: string;
  schedule_id: string;
  sports_tool_kit_option_id: string;
  tool_kit_id: string;
  user_id: string;
}

@ObjectType()
export class AlcoholToolkitOptionSelectedByUser {
  created_at: string;
  updated_at: string;
  alcohol_tool_kit_option_id: string;
  id: string;
  schedule_id: string;
  tool_kit_id: string;
  user_id: string;
}

export type ToolkitOptions =
  | SleepToolkitOption
  | WeightToolkitOption
  | AlcoholToolkitOption
  | SportsToolkitOption
  | StepsToolkitOption
  | AudioToolKitFile
  | AudioToolkitFileWithStatus;

export type ToolkitSelectedOptions =
  | WeightToolkitOptionSelectedByUser
  | MedicationToolkitInfoPlannedByUser
  | StepToolkitOptionSelectedByUser
  | SportsToolkitOptionSelectedByUser
  | AlcoholToolkitOptionSelectedByUser
  | SleepToolkitOptionSelectedByUser;

export type ToolkitAnswers =
  | SleepCheckToolkitAnswers
  | ActivityToolkitAnswers
  | HeartRateToolkitAnswers
  | BloodPressureToolkitAnswers
  | EcgToolkitAnswers
  | MeditationToolkitAnswers
  | SleepCheckToolkitAnswers
  | ActivityToolkitAnswers
  | HeartRateToolkitAnswers
  | BloodPressureToolkitAnswers
  | EcgToolkitAnswers
  | MeditationToolkitAnswers
  | MedicationToolkitAnswers
  | StepsToolkitAnswers
  | AlcoholIntakeToolkitAnswers
  | SportsToolkitAnswers
  | WeightIntakeToolkitAnswers
  | HabitToolkitAnswers
  | RunningToolkitAnswers
  | VideoToolkitAnswers
  | PodcastToolkitAnswers
  | FormToolkitAnswers
  | EpisodesToolkitAnswers
  | DrinkWaterToolkitAnswers
  | MoodToolkitAnswerWithCategory
  | VitalsToolkitAnswer
  | AudioToolkitAnswerWithPlayedAudio
  | AddictionLogToolkitAnswer
  | SymptomsLogToolkitAnswer
  | SuspiciusSymptomsLogToolkitAnswer
  | AnxietySymptomsLogToolkitAnswer
  | EmotionSymptomsLogToolkitAnswer
  | HyperActivitySymptomsLogToolkitAnswer
  | ForcedActionSymptomsLogToolkitAnswer;

export const ToolkitSelectedOptions = createUnionType({
  name: 'ToolkitSelectedOptions',
  types: () =>
    [
      SleepToolkitOptionSelectedByUser,
      MedicationToolkitInfoPlannedByUser,
      AlcoholToolkitOptionSelectedByUser,
      SportsToolkitOptionSelectedByUser,
      StepToolkitOptionSelectedByUser,
      WeightToolkitOptionSelectedByUser,
    ] as const,
  resolveType: (value) => {
    if ('sleep_tool_kit_option_id' in value) {
      return SleepToolkitOptionSelectedByUser;
    }
    if ('doses' in value) {
      return MedicationToolkitInfoPlannedByUser;
    }
    if ('weight' in value) {
      return WeightToolkitOptionSelectedByUser;
    }
    if ('steps_tool_kit_option_id' in value) {
      return StepToolkitOptionSelectedByUser;
    }
    if ('sports_tool_kit_option_id' in value) {
      return SportsToolkitOptionSelectedByUser;
    }
    if ('alcohol_tool_kit_option_id' in value) {
      return AlcoholToolkitOptionSelectedByUser;
    }

    return undefined;
  },
});

export const ToolkitOptions = createUnionType({
  name: 'ToolkitOptions',
  types: () =>
    [
      SleepToolkitOption,
      WeightToolkitOption,
      AlcoholToolkitOption,
      SportsToolkitOption,
      StepsToolkitOption,
      AudioToolKitFile,
      AudioToolkitFileWithStatus,
    ] as const,
  resolveType: (value) => {
    if ('sleep_time' in value) {
      return SleepToolkitOption;
    }
    if ('maximum_angle' in value) {
      return WeightToolkitOption;
    }
    if ('steps' in value) {
      return StepsToolkitOption;
    }
    if ('time_spent' in value) {
      return SportsToolkitOption;
    }
    if ('no_of_glasses' in value) {
      return AlcoholToolkitOption;
    }
    if ('audio_id' in value) {
      return AudioToolkitFileWithStatus;
    }
    if ('audio_id' in value) {
      return AudioToolKitFile;
    }
    return undefined;
  },
});
export enum GoalType {
  HABIT = 'HABIT',
  NORMAL = 'NORMAL',
}

registerEnumType(GoalType, { name: 'GoalType' });

const GoalData = createUnionType({
  name: 'GoalData',
  types: () => [NormalToolkitGoal, HabitToolkitGoal],
  resolveType: (value) => {
    if ('goalTitle' in value) {
      return HabitToolkitGoal;
    }
    if ('unit' in value) {
      return NormalToolkitGoal;
    }
    return undefined;
  },
});

export type GoalData = HabitToolkitGoal | NormalToolkitGoal;

@ObjectType()
export class ToolkitChallenge extends PickType(Challenge, ['id', 'title']) {
  is_joined: boolean;
}

@ObjectType()
export class NormalToolkitGoal {
  totalSessions: string;
  completedSessions: string;
  @Field(() => GraphQLInt)
  progress: number;
  selectedOption?: string;
  unit?: string;
}

@ObjectType()
export class HabitToolkitGoal {
  totalSessions: string;
  completedSessions: string;
  @Field(() => GraphQLInt)
  progress: number;
  goalTitle: string;
  goalLevel: string;
  isGoalLevelsCompleted?: boolean;
  isGoalSelected?: boolean;
}

@ObjectType()
export class Activities {
  emoji: string;
  emoji_image_file_path: string;
  emoji_image_id: string;
  emoji_image_url: string;
  title: string;
  created_at: string;
  updated_at: string;
  id: string;
}

@ObjectType()
export class Intensities {
  emoji: string;
  title: string;
  created_at: string;
  updated_at: string;
  id: string;
}

@ObjectType()
export class AlchoholTypes {
  emoji: string;
  emoji_image_file_path: string;
  emoji_image_id: string;
  emoji_image_url: string;
  title: string;
  created_at: string;
  updated_at: string;
  id: string;
}

@ObjectType()
export class SleepCheckToolkitAnswers {
  night_activity: string[];
  @Field({ nullable: true })
  session_date: string;
  @Field({ nullable: true })
  deep_sleep_time?: number;
  @Field(() => GraphQLInt)
  hlp_points_earned: number;
  @Field({ nullable: true })
  light_sleep_time?: number;
  @Field({ nullable: true })
  quality_of_sleep?: number;
  total_sleep_time: number;
  @Field({ nullable: true })
  wake_up: number;
  @Field({ nullable: true })
  note?: string;
  @Field({ nullable: true })
  note_image_file_path?: string;
  @Field({ nullable: true })
  note_image_id?: string;
  @Field({ nullable: true })
  note_image_url: string;
  created_at: string;
  updated_at: string;
  @Field({ nullable: true })
  in_bed_time: string;
  in_sleep_time: string;
  @Field({ nullable: true })
  out_bed_time?: string;
  @Field({ nullable: true })
  session_time: string;
  @Field({ nullable: true })
  wake_up_time?: string;
  @Field({ nullable: true })
  challenge_id?: string;
  @Field({ nullable: true })
  day_id?: string;
  id: string;
  schedule_id: string;
  session_id: string;
  tool_kit_id: string;
  user_id: string;
}

@ObjectType()
export class ActivityToolkitAnswers {
  session_date: string;
  @Field({ nullable: true })
  feeling?: number;
  @Field(() => GraphQLInt)
  hlp_points_earned: number;
  activity_time: number;
  @Field({ nullable: true })
  note?: string;
  @Field({ nullable: true })
  note_image_file_path?: string;
  @Field({ nullable: true })
  note_image_id?: string;
  @Field({ nullable: true })
  note_image_url: string;
  created_at: string;
  updated_at: string;
  session_time: string;
  @Field({ nullable: true })
  challenge_id: string;
  @Field({ nullable: true })
  day_id: string;
  id: string;
  schedule_id: string;
  session_id: string;
  tool_kit_id: string;
  user_id: string;

  @Field({ nullable: true })
  duration?: string;

  @Field({ nullable: true })
  consumed_duration?: string;
}

@ObjectType()
export class HeartRateToolkitAnswers {
  @Field({ nullable: true })
  session_date: string;
  @Field({ nullable: true })
  feeling?: number;
  highest_heart_rate: number;
  @Field(() => GraphQLInt)
  hlp_points_earned: number;
  lowest_heart_rate: number;
  average_heart_rate: number;
  @Field({ nullable: true })
  note?: string;
  @Field({ nullable: true })
  note_image_file_path?: string;
  @Field({ nullable: true })
  note_image_id?: string;
  @Field({ nullable: true })
  note_image_url: string;
  created_at: string;
  updated_at: string;
  @Field({ nullable: true })
  session_time: string;
  @Field({ nullable: true })
  challenge_id?: string;
  @Field({ nullable: true })
  day_id: string;
  id: string;
  schedule_id: string;
  session_id: string;
  tool_kit_id: string;
  user_id: string;
}

@ObjectType()
export class BloodPressureToolkitAnswers {
  session_date: string;
  average_bp: number;
  @Field({ nullable: true })
  feeling?: number;
  highest_bp: number;
  @Field(() => GraphQLInt)
  hlp_points_earned: number;
  lowest_bp: number;
  @Field({ nullable: true })
  note?: string;
  @Field({ nullable: true })
  note_image_file_path: string;
  @Field({ nullable: true })
  note_image_id: string;
  @Field({ nullable: true })
  note_image_url: string;
  created_at: string;
  updated_at: string;
  session_time: string;
  @Field({ nullable: true })
  challenge_id?: string;
  @Field({ nullable: true })
  day_id: string;
  id: string;
  schedule_id: string;
  session_id: string;
  tool_kit_id: string;
  user_id: string;
}

@ObjectType()
export class EcgToolkitAnswers {
  session_date: string;
  @Field(() => GraphQLInt)
  hlp_points_earned: number;
  spm: number;
  @Field({ nullable: true })
  feeling?: number;
  @Field({ nullable: true })
  note?: string;
  @Field({ nullable: true })
  note_image_file_path?: string;
  @Field({ nullable: true })
  note_image_id?: string;
  @Field({ nullable: true })
  note_image_url: string;
  created_at: string;
  updated_at: string;
  session_time: string;
  @Field({ nullable: true })
  challenge_id: string;
  @Field({ nullable: true })
  day_id: string;
  id: string;
  schedule_id: string;
  session_id: string;
  tool_kit_id: string;
  user_id: string;
}

@ObjectType()
export class MeditationToolkitAnswers {
  id: string;
  user_id: string;
  tool_kit_id: string;
  meditation_time: number;
  @Field(() => GraphQLInt)
  hlp_points_earned: number;
  @Field({ nullable: true })
  note?: string;
  session_date: string;
  session_time: string;
  schedule_id: string;
  created_at: string;
  updated_at: string;
  session_id: string;
  @Field({ nullable: true })
  challenge_id?: string;
  @Field({ nullable: true })
  day_id: string;
  @Field({ nullable: true })
  feeling?: number;
  @Field({ nullable: true })
  note_image_id?: string;
  @Field({ nullable: true })
  note_image_file_path?: string;
  @Field({ nullable: true })
  note_image_url: string;

  @Field({ nullable: true })
  duration?: string;

  @Field({ nullable: true })
  consumed_duration?: string;
}

@ObjectType()
export class MedicationToolkitAnswers {
  session_date: string;
  doses: number;
  @Field({ nullable: true })
  feeling?: number;
  @Field(() => GraphQLInt)
  hlp_points_earned: number;
  in_stock: number;
  @Field({ nullable: true })
  instructions: string;
  name: string;
  @Field({ nullable: true })
  note?: string;
  @Field({ nullable: true })
  note_image_file_path?: string;
  @Field({ nullable: true })
  note_image_id?: string;
  @Field({ nullable: true })
  note_image_url: string;
  created_at: string;
  updated_at: string;
  session_time: string;
  @Field({ nullable: true })
  challenge_id: string;
  @Field({ nullable: true })
  day_id: string;
  id: string;
  schedule_id: string;
  session_id: string;
  tool_kit_id: string;
  user_id: string;
}
@ObjectType()
export class StepsToolkitAnswers {
  id: string;
  user_id: string;
  tool_kit_id: string;
  steps: number;
  @Field({ nullable: true })
  distance: number;
  @Field({ nullable: true })
  feeling?: number;
  @Field({ nullable: true })
  note?: string;
  created_at: string;
  updated_at: string;
  session_date: string;
  session_time: string;
  schedule_id: string;
  @Field(() => GraphQLInt)
  hlp_points_earned: number;
  session_id: string;
  @Field({ nullable: true })
  challenge_id: string;
  @Field({ nullable: true })
  day_id: string;
  @Field({ nullable: true })
  note_image_url: string;
  @Field({ nullable: true })
  note_image_file_path?: string;
  @Field({ nullable: true })
  note_image_id?: string;
}

@ObjectType()
export class AlcoholIntakeToolkitAnswers {
  session_date: string;
  doses: number;
  @Field({ nullable: true })
  feeling?: number;
  @Field(() => GraphQLInt)
  hlp_points_earned: number;
  @Field({ nullable: true })
  note?: string;
  @Field({ nullable: true })
  note_image_file_path?: string;
  @Field({ nullable: true })
  note_image_id?: string;
  @Field({ nullable: true })
  note_image_url: string;
  created_at: string;
  updated_at: string;
  session_time: string;
  @Field({ nullable: true })
  alcohol_type_id: string;
  @Field({ nullable: true })
  challenge_id?: string;
  @Field({ nullable: true })
  day_id: string;
  id: string;
  schedule_id: string;
  session_id: string;
  tool_kit_id: string;
  user_id: string;

  @Field(() => AlchoholTypes, { nullable: true })
  alchohol_type?: AlchoholTypes;
}

@ObjectType()
export class SportsToolkitAnswers {
  session_date: string;
  @Field({ nullable: true })
  feeling?: number;
  @Field(() => GraphQLInt)
  hlp_points_earned: number;
  @Field({ nullable: true })
  duration?: string;
  @Field({ nullable: true })
  note?: string;
  @Field({ nullable: true })
  note_image_file_path?: string;
  @Field({ nullable: true })
  note_image_id?: string;
  @Field({ nullable: true })
  note_image_url: string;
  created_at: string;
  updated_at: string;
  session_time: string;
  @Field({ nullable: true })
  activity_id: string;
  @Field({ nullable: true })
  challenge_id?: string;
  day_id: string;
  id: string;
  @Field({ nullable: true })
  intensity_id: string;
  schedule_id: string;
  session_id: string;
  tool_kit_id: string;
  user_id: string;

  @Field(() => Activities, { nullable: true })
  activities?: Activities;
  @Field(() => Intensities, { nullable: true })
  intensities?: Intensities;
}

@ObjectType()
export class WeightIntakeToolkitAnswers {
  session_date: string;
  @Field({ nullable: true })
  feeling?: number;
  @Field(() => GraphQLInt)
  hlp_points_earned: number;
  bmi: number;
  length: number;
  weight: number;
  @Field({ nullable: true })
  note?: string;
  @Field({ nullable: true })
  note_image_file_path?: string;
  @Field({ nullable: true })
  note_image_id?: string;
  @Field({ nullable: true })
  note_image_url: string;
  created_at: string;
  updated_at: string;
  session_time: string;
  @Field({ nullable: true })
  challenge_id?: string;
  @Field({ nullable: true })
  day_id: string;
  id: string;
  schedule_id: string;
  session_id: string;
  tool_kit_id: string;
  user_id: string;
}

@ObjectType()
export class HabitToolkitAnswers {
  session_date: string;
  created_at: string;
  updated_at: string;
  session_time: string;
  day_id: string;
  id: string;
  schedule_id: string;
  session_id: string;
  tool_kit_id: string;
  user_id: string;
  habit_id: string;
}

@ObjectType()
export class PodcastToolkitAnswers {
  session_date: string;
  @Field({ nullable: true })
  feeling?: number;
  @Field(() => GraphQLInt)
  hlp_points_earned: number;
  @Field({ nullable: true })
  note?: string;
  @Field({ nullable: true })
  note_image_file_path?: string;
  @Field({ nullable: true })
  note_image_id?: string;
  @Field({ nullable: true })
  note_image_url: string;
  created_at: string;
  updated_at: string;
  session_time: string;
  @Field({ nullable: true })
  challenge_id: string;
  @Field({ nullable: true })
  day_id: string;
  id: string;
  schedule_id: string;
  session_id: string;
  tool_kit_id: string;
  user_id: string;

  @Field({ nullable: true })
  podcast_time?: number;

  @Field({ nullable: true })
  duration?: string;

  @Field({ nullable: true })
  consumed_duration?: string;
}

@ObjectType()
export class RunningToolkitAnswers {
  id: string;
  user_id: string;
  tool_kit_id: string;
  @Field(() => GraphQLInt)
  hlp_points_earned: number;
  @Field({ nullable: true })
  note?: string;
  session_date: string;
  session_time: string;
  schedule_id: string;
  created_at: string;
  updated_at: string;
  session_id: string;
  @Field({ nullable: true })
  challenge_id: string;
  @Field({ nullable: true })
  day_id: string;
  @Field({ nullable: true })
  feeling?: number;
  @Field({ nullable: true })
  note_image_url: string;
  @Field({ nullable: true })
  note_image_file_path?: string;
  @Field({ nullable: true })
  note_image_id?: string;
}

@ObjectType()
export class VideoToolkitAnswers {
  session_date: string;
  feeling?: number;
  @Field(() => GraphQLInt)
  hlp_points_earned: number;
  @Field({ nullable: true })
  note?: string;
  @Field({ nullable: true })
  note_image_file_path?: string;
  @Field({ nullable: true })
  note_image_id?: string;
  @Field({ nullable: true })
  note_image_url: string;
  created_at: string;
  updated_at: string;
  session_time: string;
  @Field({ nullable: true })
  challenge_id: string;
  @Field({ nullable: true })
  day_id: string;
  id: string;
  schedule_id: string;
  session_id: string;
  tool_kit_id: string;
  user_id: string;

  episode_session_id?: string;
}

@ObjectType()
export class EpisodesToolkitAnswers {
  session_date: string;
  @Field(() => GraphQLInt)
  hlp_points_earned: number;
  created_at: string;
  updated_at: string;
  session_time: string;
  @Field({ nullable: true })
  challenge_id: string;
  id: string;
  schedule_id: string;
  session_id: string;
  tool_kit_id: string;
  user_id: string;
}

@ObjectType()
export class FormToolkitAnswers {
  id: string;
  user_id: string;
  form_id: string;
  session_date: string;
  session_time: string;
  created_at: string;
  updated_at: string;
  tool_kit_id: string;
  @Field({ nullable: true })
  episode_id?: string;
  @Field(() => GraphQLInt)
  hlp_points_earned: number;
  @Field({ nullable: true })
  schedule_id?: string;
  session_id: string;
  @Field({ nullable: true })
  challenge_id?: string;
  @Field({ nullable: true })
  day_id: string;
  @Field({ nullable: true })
  note: string;
  @Field({ nullable: true })
  note_image_id: string;
  @Field({ nullable: true })
  note_image_file_path: string;
  @Field({ nullable: true })
  note_image_url: string;
}

@ObjectType()
export class DrinkWaterToolkitAnswers {
  session_date: string;
  @Field({ nullable: true })
  feeling?: number;
  @Field(() => GraphQLInt)
  hlp_points_earned: number;
  @Field({ nullable: true })
  note?: string;
  @Field({ nullable: true })
  note_image_file_path?: string;
  @Field({ nullable: true })
  note_image_id?: string;
  @Field({ nullable: true })
  note_image_url: string;
  created_at: string;
  updated_at: string;
  session_time: string;
  @Field({ nullable: true })
  challenge_id: string;
  @Field({ nullable: true })
  day_id: string;
  id: string;
  schedule_id: string;
  session_id: string;
  tool_kit_id: string;
  user_id: string;
}
@ObjectType()
export class MoodToolkitAnswerWithCategory extends MoodToolkitAnswer {
  @Field(() => MoodCheckCategory)
  mood_check_category: MoodCheckCategory;

  @Field(() => [MoodCheckSubCategory])
  mood_check_sub_category: MoodCheckSubCategory[];
}

@ObjectType()
export class AudioToolkitAnswerWithPlayedAudio extends AudioToolkitAnswer {
  @Field(() => [PlayedAudioToolkitAudioFile])
  played_audio_toolkit_audio_files: PlayedAudioToolkitAudioFile[];
}

@ObjectType()
export class BarGraph {
  label?: string;
  @Field(() => GraphQLFloat)
  data: number;
}

@ObjectType()
export class RangeGraph {
  label?: string;
  @Field(() => GraphQLFloat)
  start: number;
  @Field(() => GraphQLFloat)
  end: number;
}

@ObjectType()
export class ScatteredGraph {
  x?: string;
  @Field(() => GraphQLFloat)
  y: number;
}

export enum GraphType {
  BAR = 'BAR',
  RANGE = 'RANGE',
  SCATTERED = 'SCATTERED',
}

export enum GraphRange {
  DAY = 'DAY',
  MONTH = 'MONTH',
  WEEK = 'WEEK',
  YEAR = 'YEAR',
}

registerEnumType(GraphType, { name: 'GraphType' });
registerEnumType(GraphRange, { name: 'GrapgRange' });

const GraphData = createUnionType({
  name: 'GraphData',
  types: () => [BarGraph, RangeGraph, ScatteredGraph],
  resolveType: (value) => {
    if ('start' in value) {
      return RangeGraph;
    }
    if ('x' in value) {
      return ScatteredGraph;
    }
    if ('data' in value) {
      return BarGraph;
    }
    return undefined;
  },
});

export type GraphData = BarGraph | RangeGraph | ScatteredGraph;

@ObjectType()
export class GetToolkitGraphResponse {
  @Field(() => GraphType, {
    nullable: false,
    description: `GraphType will be ${Object.values(GraphType)}`,
  })
  graphType: GraphType;

  @Field(() => GraphRange, {
    nullable: false,
    description: `GraphRange will be ${Object.values(GraphRange)}`,
  })
  graphRange: GraphRange;

  @Field(() => [GraphData], { nullable: false })
  data: GraphData[];

  @Field(() => [String])
  labels?: string[];

  @Field(() => [GraphAvgResponse], { nullable: false })
  averages: GraphAvgResponse[];
}

@ArgsType()
export class GetToolkitGraphArgs {
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  toolkitId: string;

  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  date: string;

  @IsEnum(GraphRange, { message: i18nValidationMessage('is_enum') })
  @Field(() => GraphRange, {
    nullable: false,
    description: `GraphRange will be ${Object.values(GraphRange)}`,
  })
  range: GraphRange;
}
@ObjectType()
export class AnswerHistory {
  @Field({ nullable: true })
  title?: string;

  @Field(() => GraphQLISODateTime)
  session_date: string;

  @Field(() => GraphQLInt, { nullable: true })
  emoji?: number;

  session_id: string;

  // used for mood check Toolkit only
  @Field(() => String, { nullable: true })
  mood_emoji_file_path?: string;

  schedule_id: string;

  @Field(() => String, { nullable: true })
  toolkit_id?: string;
}

@ObjectType()
export class AnswersHistoryRewards {
  earned: number;
  bonuses: number;
}

@ObjectType()
export class AnswersHistoryStreak {
  streak_count: number;
  is_completed: boolean;
}

@ObjectType()
export class GetAnswersHistoryResponse {
  @Field(() => AnswersHistoryRewards)
  rewards: AnswersHistoryRewards;

  @Field(() => [AnswersHistoryStreak], { nullable: 'items' })
  streaks: AnswersHistoryStreak[];

  @Field(() => [AnswerHistory], { nullable: 'items' })
  history: AnswerHistory[];

  @Field(() => [String], { nullable: 'items' })
  calender: string[];
}

@ArgsType()
export class GetAnswersHistoryArgs {
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  id: string;

  @Field(() => GraphQLISODateTime)
  @IsDate()
  date: string;

  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  checkinId?: string;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsNumber({}, { message: i18nValidationMessage('is_number') })
  @Field(() => GraphQLInt)
  page?: number;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsNumber({}, { message: i18nValidationMessage('is_number') })
  @Field(() => GraphQLInt)
  size?: number;
}

@ArgsType()
export class GetAnswersHistoryCalenderArgs extends GetAnswersHistoryArgs {}

@ObjectType()
export class GetAnswersHistoryCalenderResponse {
  @Field(() => [String], { nullable: 'items' })
  calender: string[];
}

export const answersHistoryTitleFormats = new Map<string, string>([
  [ToolkitType.MEDICATION, `name,' ','( ',doses,' )'`],
  [ToolkitType.STEPS, 'steps'],
  [ToolkitType.SLEEP_CHECK, 'total_sleep_time'],
  [ToolkitType.ACTIVITY, 'consumed_duration'],
  [ToolkitType.MEDITATION, 'consumed_duration'],
  [ToolkitType.PODCAST, 'consumed_duration'],
  [ToolkitType.ALCOHOL_INTAKE, 'doses'],
  [ToolkitType.BLOOD_PRESSURE, `lowest_bp,'-',highest_bp`],
  [ToolkitType.ECG, 'spm'],
  [ToolkitType.HEART_RATE, `average_heart_rate`],
  [ToolkitType.WEIGHT, `weight,'kg'`],
  [ToolkitType.SPORT, 'duration'],
  [ToolkitType.VITALS, `diastolic_value,'-',systolic_value`],
  [ToolkitType.SYMPTOMS_LOG, `symptom_level`],
  [ToolkitType.EMOTION_SYMPTOMS_LOG, `emotion_symptom_level`],
  [ToolkitType.FORCED_ACTION_SYMPTOMS_LOG, `forced_action_symptom_level`],
  [ToolkitType.ANXIETY_SYMPTOMS_LOG, `anxiety_symptom_level`],
  [ToolkitType.SUSPICIUS_SYMPTOMS_LOG, `suspicius_symptom_level`],
  [ToolkitType.HYPER_ACTIVITY_SYMPTOMS_LOG, `hyper_activity_symptom_level`],
  //:below fields not availble in db, if removed throwing error in calendersHistory
  [ToolkitType.HABIT, 'empty'],
  [ToolkitType.EPISODES, 'empty'],
  [ToolkitType.FORM, 'empty'],
  [ToolkitType.DRINK_WATER, 'empty'],
  [ToolkitType.RUNNING, 'empty'],
  [ToolkitType.VIDEO, 'empty'],
  [ToolkitType.MOOD, 'empty'],
  [ToolkitType.AUDIO, 'empty'],
  [ToolkitType.ADDICTION_LOG, 'empty'],
]);

export const answersHistoryEmojiFields = new Map<string, string>([
  [ToolkitType.MEDICATION, `feeling`],
  [ToolkitType.STEPS, 'feeling'],
  [ToolkitType.SLEEP_CHECK, 'quality_of_sleep'],
  [ToolkitType.ACTIVITY, 'feeling'],
  [ToolkitType.MEDITATION, 'feeling'],
  [ToolkitType.ALCOHOL_INTAKE, 'feeling'],
  [ToolkitType.BLOOD_PRESSURE, `feeling`],
  [ToolkitType.ECG, 'feeling'],
  [ToolkitType.HEART_RATE, `feeling`],
  [ToolkitType.WEIGHT, `feeling`],
  [ToolkitType.PODCAST, 'feeling'],
  [ToolkitType.RUNNING, 'feeling'],
  [ToolkitType.SPORT, 'feeling'],
  [ToolkitType.VIDEO, 'feeling'],
  [ToolkitType.AUDIO, 'feeling'],
  [ToolkitType.VITALS, 'feeling'],
  [ToolkitType.DRINK_WATER, 'feeling'],
  [ToolkitType.ADDICTION_LOG, 'feeling'],
  [ToolkitType.SYMPTOMS_LOG, 'feeling'],
  [ToolkitType.EMOTION_SYMPTOMS_LOG, 'feeling'],
  [ToolkitType.FORCED_ACTION_SYMPTOMS_LOG, 'feeling'],
  [ToolkitType.ANXIETY_SYMPTOMS_LOG, 'feeling'],
  [ToolkitType.SUSPICIUS_SYMPTOMS_LOG, 'feeling'],
  [ToolkitType.HYPER_ACTIVITY_SYMPTOMS_LOG, 'feeling'],
]);

export const toolkitAnswerTables = new Map<string, string>([
  [ToolkitType.MEDICATION, `medication_tool_kit_answers`],
  [ToolkitType.STEPS, 'steps_tool_kit_answers'],
  [ToolkitType.SLEEP_CHECK, 'sleep_check_tool_kit_answers'],
  [ToolkitType.ACTIVITY, 'activity_tool_kit_answers'],
  [ToolkitType.ALCOHOL_INTAKE, 'alcohol_intake_tool_kit_answers'],
  [ToolkitType.BLOOD_PRESSURE, 'blood_pressure_tool_kit_answers'],
  [ToolkitType.DRINK_WATER, 'drink_water_tool_kit_answers'],
  [ToolkitType.ECG, 'ecg_tool_kit_answers'],
  [ToolkitType.EPISODES, 'tool_kit_episodes_answers'],
  [ToolkitType.FORM, 'user_form_answers'],
  [ToolkitType.HABIT, 'habit_tool_kit_answers'],
  [ToolkitType.HEART_RATE, 'heart_rate_tool_kit_answers'],
  [ToolkitType.MEDITATION, 'meditation_tool_kit_answers'],
  [ToolkitType.PODCAST, 'podcast_tool_kit_answers'],
  [ToolkitType.RUNNING, 'running_tool_kit_answers'],
  [ToolkitType.SPORT, 'sports_tool_kit_answers'],
  [ToolkitType.VIDEO, 'video_tool_kit_answers'],
  [ToolkitType.WEIGHT, 'weight_intake_tool_kit_answers'],
  [ToolkitType.AUDIO, 'audio_tool_kit_answers_table'],
  [ToolkitType.VITALS, 'vitals_tool_kit_answers'],
  [ToolkitType.MOOD, 'mood_tool_kit_answers'],
  [ToolkitType.ADDICTION_LOG, 'addiction_log_tool_kit_answers'],
  [ToolkitType.SYMPTOMS_LOG, 'symptoms_log_tool_kit_answers'],
  [ToolkitType.EMOTION_SYMPTOMS_LOG, 'emotion_symptoms_log_tool_kit_answers'],
  [ToolkitType.ANXIETY_SYMPTOMS_LOG, 'anxiety_symptoms_log_tool_kit_answers'],
  [
    ToolkitType.SUSPICIUS_SYMPTOMS_LOG,
    'suspicius_symptoms_log_tool_kit_answers',
  ],
  [
    ToolkitType.HYPER_ACTIVITY_SYMPTOMS_LOG,
    'hyper_activity_symptoms_log_tool_kit_answers',
  ],
  [
    ToolkitType.FORCED_ACTION_SYMPTOMS_LOG,
    'forced_action_symptoms_log_tool_kit_answers',
  ],
]);

export const toolkitOptionsTableNames = new Map<string, string>([
  [ToolkitType.STEPS, 'steps_tool_kit_options'],
  [ToolkitType.SLEEP_CHECK, 'sleep_tool_kit_options'],
  [ToolkitType.ALCOHOL_INTAKE, 'alcohol_tool_kit_options'],
  [ToolkitType.SPORT, 'sports_tool_kit_options'],
  [ToolkitType.WEIGHT, 'weight_tool_kit_options'],
  //added empty to avoid error
  [ToolkitType.MEDICATION, 'empty'],
]);

export const toolkitOptionsFieldNames = new Map<string, string>([
  [ToolkitType.STEPS, 'steps'],
  [ToolkitType.SLEEP_CHECK, 'sleep_time'],
  [ToolkitType.ALCOHOL_INTAKE, 'no_of_glasses'],
  [ToolkitType.SPORT, 'time_spent'],
  //added empty to avoid error
  [ToolkitType.WEIGHT, 'empty'],
  [ToolkitType.MEDICATION, 'empty'],
]);

export const toolkitAnswersValueFieldNames = new Map<string, string>([
  [ToolkitType.STEPS, 'steps'],
  [ToolkitType.SLEEP_CHECK, 'total_sleep_time'],
  [ToolkitType.ALCOHOL_INTAKE, 'doses'],
  [ToolkitType.SPORT, 'duration'],
  [ToolkitType.WEIGHT, 'weight'],
  [ToolkitType.MEDICATION, 'doses'],
]);

export const toolkitSelectedOptionTables = new Map<string, string>([
  [ToolkitType.STEPS, 'step_tool_kit_option_selected_by_user'],
  [ToolkitType.SLEEP_CHECK, 'sleep_tool_kit_option_selected_by_user'],
  [ToolkitType.ALCOHOL_INTAKE, 'alcohol_tool_kit_option_selected_by_user'],
  [ToolkitType.SPORT, 'sports_tool_kit_option_selected_by_user'],
  [ToolkitType.WEIGHT, 'weight_tool_kit_option_selected_by_user'],
  [ToolkitType.MEDICATION, 'medication_tool_kit_info_planned_by_user'],
]);

export const toolkitOptionsSelectedFieldNames = new Map<string, string>([
  [ToolkitType.STEPS, 'steps_tool_kit_option_id'],
  [ToolkitType.SLEEP_CHECK, 'sleep_tool_kit_option_id'],
  [ToolkitType.ALCOHOL_INTAKE, 'alcohol_tool_kit_option_id'],
  [ToolkitType.SPORT, 'sports_tool_kit_option_id'],
  [ToolkitType.WEIGHT, 'weight'],
  [ToolkitType.MEDICATION, 'doses'],
]);

export const toolkitTypesWithOptions = [
  ToolkitType.SLEEP_CHECK,
  ToolkitType.ALCOHOL_INTAKE,
  ToolkitType.STEPS,
  ToolkitType.SPORT,
  ToolkitType.MEDICATION,
  ToolkitType.WEIGHT,
];
export class AnswersHistoryCalenderQueryResult {
  day: Date;
}

export const noTitleToolkits = [
  ToolkitType.DRINK_WATER,
  ToolkitType.ADDICTION_LOG,
  ToolkitType.RUNNING,
  ToolkitType.VIDEO,
];

@ObjectType()
export class GraphAvgResponse {
  label: string;
  value: string;
}

export enum GraphAverageLabels {
  BLOOD_PRESSURE = 'graph_label_for_blood_pressure',
  WEIGHT = 'graph_label_for_weight',
  ALCOHOL_INTAKE = 'graph_label_for_alcohol_intake',
  TOTAL_SLEEP = 'graph_label_for_total_sleep',
  LIGHT_SLEEP = 'graph_label_for_light_sleep',
  DEEP_SLEEP = 'graph_label_for_deep_sleep',
  SPORT = 'graph_label_for_sport',
  HEART_RATE = 'graph_label_for_heart_rate',
  ECG = 'graph_label_for_ecg',
  STEPS = 'graph_label_for_steps',
  STEPS_DISTANCE = 'graph_label_for_steps_distance',
  MEDITATION = 'graph_label_for_meditation',
}

@InputType()
export class FilterToolkitCategoriesByGoalsInput {
  @Field(() => [String], { nullable: false })
  @Type(() => String)
  @IsArray()
  goal_ids: string[];
}
@ObjectType()
export class ToolkitCategory {
  @Field(() => String, { nullable: true })
  id: string;
  @Field(() => String, { nullable: true })
  title: string;
  @Field(() => String, { nullable: true })
  description: string;
  @Field(() => String, { nullable: true })
  age_group: string;
  @Field(() => String, { nullable: true })
  avatar: string;
  @Field(() => String, { nullable: true })
  image_url: string;
  @Field(() => String, { nullable: true })
  image_id: string;
  @Field(() => String, { nullable: true })
  file_path: string;
  @Field(() => String, { nullable: true })
  text_color: string;
  @Field(() => String, { nullable: true })
  background_color: string;
  @Field(() => String, { nullable: true })
  created_at: string;
  @Field(() => String, { nullable: true })
  updated_at: string;
}

@ArgsType()
export class SearchToolkitsArgs {
  @Field(() => [String], {
    nullable: 'itemsAndList',
    description: 'ids of goals to filter',
  })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid'), each: true })
  @IsArray()
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  goalIds: string[];

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Length(1)
  name: string;
}

@ObjectType()
export class SearchToolkitsResponse {
  @Field(() => [Toolkit], { nullable: 'items' })
  toolkits: Toolkit[];
}
@ArgsType()
export class GetToolkitAnswerArgs {
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  toolkitId: string;

  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  sessionId: string;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  habitId?: string;
}

export const ToolkitAnswers = createUnionType({
  name: 'ToolkitAnswers',
  types: () =>
    [
      SleepCheckToolkitAnswers,
      ActivityToolkitAnswers,
      HeartRateToolkitAnswers,
      BloodPressureToolkitAnswers,
      EcgToolkitAnswers,
      MeditationToolkitAnswers,
      MedicationToolkitAnswers,
      StepsToolkitAnswers,
      AlcoholIntakeToolkitAnswers,
      SportsToolkitAnswers,
      WeightIntakeToolkitAnswers,
      HabitToolkitAnswers,
      PodcastToolkitAnswers,
      RunningToolkitAnswers,
      VideoToolkitAnswers,
      FormToolkitAnswers,
      EpisodesToolkitAnswers,
      DrinkWaterToolkitAnswers,
      VitalsToolkitAnswer,
      MoodToolkitAnswerWithCategory,
      AudioToolkitAnswerWithPlayedAudio,
      AddictionLogToolkitAnswer,
      SymptomsLogToolkitAnswer,
      SuspiciusSymptomsLogToolkitAnswer,
      AnxietySymptomsLogToolkitAnswer,
      EmotionSymptomsLogToolkitAnswer,
      HyperActivitySymptomsLogToolkitAnswer,
      ForcedActionSymptomsLogToolkitAnswer,
    ] as const,
  resolveType: (value) => {
    if ('mood_category_id' in value) {
      return MoodToolkitAnswerWithCategory;
    }
    if ('played_audio_toolkit_audio_files' in value) {
      return AudioToolkitAnswerWithPlayedAudio;
    }
    if ('diastolic_value' in value) {
      return VitalsToolkitAnswer;
    }
    if ('total_sleep_time' in value) {
      return SleepCheckToolkitAnswers;
    }
    if ('activity_time' in value) {
      return ActivityToolkitAnswers;
    }
    if ('lowest_heart_rate' in value) {
      return HeartRateToolkitAnswers;
    }
    if ('lowest_bp' in value) {
      return BloodPressureToolkitAnswers;
    }
    if ('spm' in value) {
      return EcgToolkitAnswers;
    }
    if ('meditation_time' in value) {
      return MeditationToolkitAnswers;
    }
    if ('in_stock' in value) {
      return MedicationToolkitAnswers;
    }
    if ('steps' in value) {
      return StepsToolkitAnswers;
    }
    if ('doses' in value) {
      return AlcoholIntakeToolkitAnswers;
    }
    if ('activity_id' in value) {
      return SportsToolkitAnswers;
    }
    if ('weight' in value) {
      return WeightIntakeToolkitAnswers;
    }
    if ('habit_id' in value) {
      return HabitToolkitAnswers;
    }
    if ('form_id' in value) {
      return FormToolkitAnswers;
    }
    if ('podcast_time' in value) {
      return PodcastToolkitAnswers;
    }
    if ('addiction_log_answer' in value) {
      return AddictionLogToolkitAnswer;
    }
    if ('symptom_level' in value) {
      return SymptomsLogToolkitAnswer;
    }
    if ('suspicius_symptom_level' in value) {
      return SuspiciusSymptomsLogToolkitAnswer;
    }
    if ('anxiety_symptom_level' in value) {
      return AnxietySymptomsLogToolkitAnswer;
    }
    if ('emotion_symptom_level' in value) {
      return EmotionSymptomsLogToolkitAnswer;
    }
    if ('hyper_activity_symptom_level' in value) {
      return HyperActivitySymptomsLogToolkitAnswer;
    }
    if ('forced_action_symptom_level' in value) {
      return ForcedActionSymptomsLogToolkitAnswer;
    }
    //below toolkits have all same fields so result will always be RunningToolkitAnswers

    if ('feeling' in value) {
      return RunningToolkitAnswers;
    }
    if ('feeling' in value) {
      return VideoToolkitAnswers;
    }
    if ('feeling' in value) {
      return DrinkWaterToolkitAnswers;
    }
    if ('hlp_points_earned' in value) {
      return EpisodesToolkitAnswers;
    }

    return undefined;
  },
});

@ObjectType()
export class ToolkitHistoryPopupResponse {
  scheduleType?: string;
  toolkitType?: string;

  @Field(() => [ToolkitAnswers], { nullable: true })
  toolkitAnswers?: [ToolkitAnswers];

  toolkit: Toolkit;

  @Field(() => GoalType, { nullable: true })
  goalType?: GoalType;

  @Field(() => GoalData, { nullable: true })
  goalData?: GoalData;
}
