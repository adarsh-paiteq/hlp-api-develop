import { i18nValidationMessage } from '@core/modules/i18n-next';
import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { ToolkitType } from '@toolkits/toolkits.model';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  ValidateNested,
} from 'class-validator';

@InputType()
export class EmotionSymptomsLogAnswerInput {
  @Field(() => Int)
  @IsNumber({}, { message: i18nValidationMessage('is_number') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  emotion_symptom_level: number;
}

@InputType()
export class AnxietySymptomsLogAnswerInput {
  @Field(() => Int)
  @IsNumber({}, { message: i18nValidationMessage('is_number') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  anxiety_symptom_level: number;
}

@InputType()
export class SuspiciusSymptomsLogAnswerInput {
  @Field(() => Int)
  @IsNumber({}, { message: i18nValidationMessage('is_number') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  suspicius_symptom_level: number;
}

@InputType()
export class ForcedActionSymptomsLogAnswerInput {
  @Field(() => Int)
  @IsNumber({}, { message: i18nValidationMessage('is_number') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  forced_action_symptom_level: number;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  forced_action_symptom_duration: string;
}

@InputType()
export class HyperActivitySymptomsLogAnswerInput {
  @Field(() => Int)
  @IsNumber({}, { message: i18nValidationMessage('is_number') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  hyper_activity_symptom_level: number;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  hyper_activity_duration: string;
}

@InputType()
export class AddictionLogAnswerInput {
  @Field(() => Boolean)
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  addiction_log_answer: boolean;
}

@InputType()
export class ToolkitAnswerInput {
  @Field(() => EmotionSymptomsLogAnswerInput, { nullable: true })
  @Type(() => EmotionSymptomsLogAnswerInput)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  emotion_symptoms_log_input: EmotionSymptomsLogAnswerInput;

  @Field(() => AnxietySymptomsLogAnswerInput, { nullable: true })
  @Type(() => AnxietySymptomsLogAnswerInput)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  anxiety_symptoms_log_input: AnxietySymptomsLogAnswerInput;

  @Field(() => SuspiciusSymptomsLogAnswerInput, { nullable: true })
  @Type(() => SuspiciusSymptomsLogAnswerInput)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  suspicius_symptoms_log_input: SuspiciusSymptomsLogAnswerInput;

  @Field(() => ForcedActionSymptomsLogAnswerInput, { nullable: true })
  @Type(() => ForcedActionSymptomsLogAnswerInput)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  forced_action_symptoms_log_input: ForcedActionSymptomsLogAnswerInput;

  @Field(() => HyperActivitySymptomsLogAnswerInput, { nullable: true })
  @Type(() => HyperActivitySymptomsLogAnswerInput)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  hyper_activity_symptoms_log_input: HyperActivitySymptomsLogAnswerInput;

  @Field(() => AddictionLogAnswerInput, { nullable: true })
  @Type(() => AddictionLogAnswerInput)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  addiction_log_input: AddictionLogAnswerInput;
}

@InputType()
export class SaveToolkitAnswersInput {
  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  schedule_id: string;

  @Field(() => String)
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_date: string;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_time: string;

  @Field(() => Int, { nullable: true })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsNumber({}, { message: i18nValidationMessage('is_number') })
  feeling?: number;

  @Field(() => String, { nullable: true })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsString({ message: i18nValidationMessage('is_string') })
  note_image_id?: string;

  @Field(() => String, { nullable: true })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsString({ message: i18nValidationMessage('is_string') })
  note_image_file_path?: string;

  @Field(() => String, { nullable: true })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsUrl({}, { message: i18nValidationMessage('is_url') })
  @IsString({ message: i18nValidationMessage('is_string') })
  note_image_url?: string;

  @Field(() => String, { nullable: true })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsString({ message: i18nValidationMessage('is_string') })
  note?: string;

  @Field(() => String, { nullable: true })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  challenge_id?: string;

  @Field(() => String, { nullable: true })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  day_id?: string;

  @Field(() => ToolkitAnswerInput)
  @Type(() => ToolkitAnswerInput)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  toolkit_answer_input: ToolkitAnswerInput;
}

export class SaveToolkitAnswerInput {
  user_id: string;
  tool_kit_id: string;
  session_date: string;
  session_time: string;
  schedule_id: string;
  hlp_points_earned: number;
  feeling?: number;
  note?: string;
  challenge_id?: string;
  day_id?: string;
  note_image_id?: string;
  note_image_file_path?: string;
  note_image_url?: string;
  anxiety_symptom_level?: number;
  emotion_symptom_level?: number;
  suspicius_symptom_level?: number;
  forced_action_symptom_level?: number;
  forced_action_symptom_duration?: string;
  hyper_activity_symptom_level?: number;
  hyper_activity_duration?: string;
  addiction_log_answer?: boolean;
  days_without_addiction?: number;
}

@ObjectType()
export class ToolkitAnswerData {
  @Field(() => String)
  id: string;

  @Field(() => String)
  schedule_id: string;
}

@ObjectType()
export class SaveToolkitAnswerResponse {
  @Field(() => String)
  message: string;

  @Field(() => ToolkitAnswerData)
  data: ToolkitAnswerData;
}

export const toolkitAnswerInputFields = new Map<
  ToolkitType,
  keyof ToolkitAnswerInput
>([
  // [ToolkitType.MEDICATION, `medication_tool_kit_answers`],
  // [ToolkitType.STEPS, 'steps_tool_kit_answers'],
  // [ToolkitType.SLEEP_CHECK, 'sleep_check_tool_kit_answers'],
  // [ToolkitType.ACTIVITY, 'activity_tool_kit_answers'],
  // [ToolkitType.ALCOHOL_INTAKE, 'alcohol_intake_tool_kit_answers'],
  // [ToolkitType.BLOOD_PRESSURE, 'blood_pressure_tool_kit_answers'],
  // [ToolkitType.DRINK_WATER, 'drink_water_tool_kit_answers'],
  // [ToolkitType.ECG, 'ecg_tool_kit_answers'],
  // [ToolkitType.EPISODES, 'tool_kit_episodes_answers'],
  // [ToolkitType.FORM, 'user_form_answers'],
  // [ToolkitType.HABIT, 'habit_tool_kit_answers'],
  // [ToolkitType.HEART_RATE, 'heart_rate_tool_kit_answers'],
  // [ToolkitType.MEDITATION, 'meditation_tool_kit_answers'],
  // [ToolkitType.PODCAST, 'podcast_tool_kit_answers'],
  // [ToolkitType.RUNNING, 'running_tool_kit_answers'],
  // [ToolkitType.SPORT, 'sports_tool_kit_answers'],
  // [ToolkitType.VIDEO, 'video_tool_kit_answers'],
  // [ToolkitType.WEIGHT, 'weight_intake_tool_kit_answers'],
  // [ToolkitType.AUDIO, 'audio_tool_kit_answers_table'],
  // [ToolkitType.VITALS, 'vitals_tool_kit_answers'],
  // [ToolkitType.MOOD, 'mood_tool_kit_answers'],
  [ToolkitType.ADDICTION_LOG, 'addiction_log_input'],
  [ToolkitType.EMOTION_SYMPTOMS_LOG, 'emotion_symptoms_log_input'],
  [ToolkitType.ANXIETY_SYMPTOMS_LOG, 'anxiety_symptoms_log_input'],
  [ToolkitType.SUSPICIUS_SYMPTOMS_LOG, 'suspicius_symptoms_log_input'],
  [
    ToolkitType.HYPER_ACTIVITY_SYMPTOMS_LOG,
    'hyper_activity_symptoms_log_input',
  ],
  [ToolkitType.FORCED_ACTION_SYMPTOMS_LOG, 'forced_action_symptoms_log_input'],
]);
