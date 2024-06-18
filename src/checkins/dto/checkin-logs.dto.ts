import {
  ArgsType,
  Field,
  GraphQLISODateTime,
  Int,
  ObjectType,
  PickType,
} from '@nestjs/graphql';
import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator';
import { GraphQLBoolean, GraphQLInt } from 'graphql';
import { Schedule } from '../../schedules/schedules.model';
import {
  AnswerHistory,
  ToolkitAnswers,
  ToolkitType,
} from '../../toolkits/toolkits.model';
import { i18nValidationMessage } from '@core/modules/i18n-next';

@ObjectType()
export class CheckinToolkitAnswers {
  schedule_id: string;
  answers: ToolkitAnswers[];
}

@ObjectType()
export class ScheduleAndCheckinWithAnswers extends Schedule {
  @Field(() => ToolkitType)
  tool_kit_type: ToolkitType;
  @Field(() => String)
  tool_kit_category: string;
  @Field(() => String)
  goal_id: string;
  @Field(() => String)
  check_ins_title: string;
  @Field(() => String)
  check_ins_avatar: string;
  @Field(() => String)
  emoji_image_url: string;
  @Field(() => String)
  emoji_image_id: string;
  @Field(() => String)
  emoji_image_file_path: string;
  @Field(() => String)
  toolkit_unit: string;
  toolkit_answers?: CheckinToolkitAnswers;
}

@ObjectType()
export class CheckinLog extends AnswerHistory {
  @Field({ nullable: true })
  title?: string;

  @Field(() => GraphQLISODateTime)
  session_date: string;

  @Field(() => GraphQLInt, { nullable: true })
  emoji?: number;

  session_id: string;
}

@ArgsType()
export class GetCheckinLogsArgs {
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field(() => String, { nullable: false })
  id: string;
}

@ObjectType()
export class GetCheckinLogsReponse {
  @Field(() => [CheckinLog], { nullable: 'items' })
  logs: CheckinLog[];
}
@ObjectType()
export class ScheduleCheckinDetails extends PickType(
  ScheduleAndCheckinWithAnswers,
  [
    'check_ins_title',
    'check_ins_avatar',
    'emoji_image_file_path',
    'emoji_image_id',
    'emoji_image_url',
    'goal_id',
    'challenge_id',
    'check_in',
    'tool_kit',
    'tool_kit_type',
    'tool_kit_category',
    'user',
    'toolkit_unit',
    'id',
  ],
) {
  @Field(() => GraphQLInt)
  total_sessons: number;

  @Field(() => GraphQLInt)
  completed_sessions: number;
}

@ObjectType()
export class MyLogs {
  @Field(() => String)
  sessionTime: string;

  @Field(() => GraphQLInt, { nullable: true })
  emoji?: number;

  @Field(() => String)
  sessionId: string;
}

@ObjectType()
export class MoodCheckLogs extends PickType(MyLogs, ['emoji', 'sessionTime']) {}

@ObjectType()
export class SleepLogs extends PickType(MyLogs, [
  'emoji',
  'sessionTime',
  'sessionId',
]) {
  @Field(() => String)
  sleepTime: string;
}

@ObjectType()
export class SleepCheckin {
  @Field(() => ScheduleCheckinDetails)
  scheduleCheckin?: ScheduleCheckinDetails;

  @Field(() => [SleepLogs], { nullable: 'items' })
  logs: SleepLogs[];
}

@ObjectType()
export class HeartRateLogs extends PickType(MyLogs, [
  'emoji',
  'sessionTime',
  'sessionId',
]) {
  @Field(() => GraphQLInt)
  heartRate: number;
}
@ObjectType()
export class HeartRateCheckin {
  @Field(() => ScheduleCheckinDetails)
  scheduleCheckin?: ScheduleCheckinDetails;

  @Field(() => [HeartRateLogs], { nullable: 'items' })
  logs: HeartRateLogs[];
}

@ObjectType()
export class BloodPressureLogs extends PickType(MyLogs, [
  'emoji',
  'sessionTime',
  'sessionId',
]) {
  @Field(() => GraphQLInt)
  lowestBp: number;

  @Field(() => GraphQLInt)
  higestBp: number;
}

@ObjectType()
export class BloodPressureCheckin {
  @Field(() => ScheduleCheckinDetails)
  scheduleCheckin?: ScheduleCheckinDetails;

  @Field(() => [BloodPressureLogs], { nullable: 'items' })
  logs: BloodPressureLogs[];
}

@ObjectType()
export class StepsLogs extends PickType(MyLogs, [
  'emoji',
  'sessionTime',
  'sessionId',
]) {
  @Field(() => GraphQLInt)
  steps: number;
}

@ObjectType()
export class StepsCheckin {
  @Field(() => ScheduleCheckinDetails)
  scheduleCheckin?: ScheduleCheckinDetails;

  @Field(() => [StepsLogs], { nullable: true })
  logs?: StepsLogs[];
}

@ObjectType()
export class WeightLogs extends PickType(MyLogs, [
  'emoji',
  'sessionTime',
  'sessionId',
]) {
  @Field(() => GraphQLInt)
  weight: number;
}

@ObjectType()
export class WeightCheckin {
  @Field(() => ScheduleCheckinDetails)
  scheduleCheckin?: ScheduleCheckinDetails;

  @Field(() => [WeightLogs], { nullable: true })
  logs?: WeightLogs[];
}
@ObjectType()
export class MedicationLogs extends PickType(MyLogs, [
  'emoji',
  'sessionTime',
  'sessionId',
]) {
  @Field(() => String)
  medication: string;

  @Field(() => GraphQLBoolean)
  isCompleted: boolean;
}

@ObjectType()
export class MoodLogs extends PickType(MyLogs, ['sessionTime', 'sessionId']) {
  @Field(() => String)
  mood_category_id: string;

  @Field(() => String)
  mood_category_file_path: string;

  @Field(() => String)
  mood_category_background_colour: string;
}

@ObjectType()
export class AddictionLogs extends PickType(MyLogs, [
  'emoji',
  'sessionTime',
  'sessionId',
]) {
  @Field(() => Boolean)
  addiction_log_answer: boolean;

  @Field(() => Int)
  days_without_addiction: number;
}

@ObjectType()
export class SymptomsLogs extends PickType(MyLogs, [
  'emoji',
  'sessionTime',
  'sessionId',
]) {
  @Field(() => GraphQLInt)
  symptom_level: number;
}

@ObjectType()
export class MedicationCheckin {
  @Field(() => ScheduleCheckinDetails)
  scheduleCheckin?: ScheduleCheckinDetails;

  @Field(() => [MedicationLogs], { nullable: true })
  logs?: MedicationLogs[];
}

@ObjectType()
export class MoodCheckCheckin {
  @Field(() => ScheduleCheckinDetails, { nullable: true })
  scheduleCheckin?: ScheduleCheckinDetails;

  @Field(() => [MoodCheckLogs], { nullable: true })
  logs?: MoodCheckLogs[];
}

@ArgsType()
export class GetCheckinLogsArgsNew {
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field(() => String)
  date: string;
}

@ObjectType()
export class GetCheckinLogsReponseNew {
  @Field(() => MoodCheckCheckin, { nullable: true })
  moodCheckCheckin: MoodCheckCheckin;

  @Field(() => MedicationCheckin, { nullable: true })
  medicationCheckin?: MedicationCheckin;

  @Field(() => SleepCheckin, { nullable: true })
  sleepCheckin?: SleepCheckin;

  @Field(() => HeartRateCheckin, { nullable: true })
  heartRateCheckin?: HeartRateCheckin;

  @Field(() => BloodPressureCheckin, { nullable: true })
  bloodPressureCheckin?: BloodPressureCheckin;

  @Field(() => StepsCheckin, { nullable: true })
  stepsCheckin?: StepsCheckin;

  @Field(() => WeightCheckin, { nullable: true })
  weightCheckin?: WeightCheckin;
}

@ObjectType()
export class EmotionSymptomsLogs extends PickType(MyLogs, [
  'emoji',
  'sessionTime',
  'sessionId',
]) {
  @Field(() => GraphQLInt)
  emotion_symptom_level: number;
}

@ObjectType()
export class AnxietySymptomsLogs extends PickType(MyLogs, [
  'emoji',
  'sessionTime',
  'sessionId',
]) {
  @Field(() => GraphQLInt)
  anxiety_symptom_level: number;
}

@ObjectType()
export class SuspiciusSymptomsLogs extends PickType(MyLogs, [
  'emoji',
  'sessionTime',
  'sessionId',
]) {
  @Field(() => GraphQLInt)
  suspicius_symptom_level: number;
}

@ObjectType()
export class ForcedActionSymptomsLogs extends PickType(MyLogs, [
  'emoji',
  'sessionTime',
  'sessionId',
]) {
  @Field(() => GraphQLInt)
  forced_action_symptom_level: number;
}

@ObjectType()
export class HyperActivitySymptomsLogs extends PickType(MyLogs, [
  'emoji',
  'sessionTime',
  'sessionId',
]) {
  @Field(() => GraphQLInt)
  hyper_activity_symptom_level: number;
}
