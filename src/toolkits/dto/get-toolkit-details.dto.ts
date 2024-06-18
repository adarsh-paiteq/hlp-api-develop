import { ArgsType, createUnionType, Field, ObjectType } from '@nestjs/graphql';
import { IsDateString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { Schedule } from '../../schedules/schedules.model';
import { AudioToolKitFile } from '../entities/audio-toolkit-files.entity';
import {
  Toolkit,
  ToolkitChallenge,
  ToolkitOptions,
  ToolkitSelectedOptions,
  ToolkitType,
} from '../toolkits.model';
import { AudioToolkitFileWithStatus } from './get-audio-toolkit-details.dto';
import { i18nValidationMessage } from '@core/modules/i18n-next';

export const normalHabitToolkits = [
  ToolkitType.PODCAST,
  ToolkitType.ACTIVITY,
  ToolkitType.RUNNING,
  ToolkitType.VIDEO,
  ToolkitType.MEDITATION,
  ToolkitType.DRINK_WATER,
  ToolkitType.MOOD,
  ToolkitType.ADDICTION_LOG,
  ToolkitType.SYMPTOMS_LOG,
];

export const toolkitsWithOptions = [
  ToolkitType.STEPS,
  ToolkitType.SLEEP_CHECK,
  ToolkitType.ALCOHOL_INTAKE,
  ToolkitType.SPORT,
  ToolkitType.WEIGHT,
  ToolkitType.MEDICATION,
];

export const toolkitsWithoutOptions = [
  ToolkitType.BLOOD_PRESSURE,
  ToolkitType.HEART_RATE,
  ToolkitType.ECG,
  ToolkitType.VITALS,
];

@ObjectType()
export class ToolkitGoalWithoutOptions {
  @Field()
  completedSessions: number;
  @Field()
  totalSessions: number;
  @Field()
  progress: number;
  @Field()
  scheduleType: string;
}

@ObjectType()
export class ToolkitGoalWithOptions {
  @Field()
  loggedData: number;
  @Field()
  selectedOption: number;
  @Field()
  progress: number;
  @Field()
  scheduleType: string;
}

@ObjectType()
export class NormalHabitToolkitGoal {
  @Field()
  goalTitle: string;
  @Field()
  goalLevelTitle: string;
  @Field()
  goalEmojiImageUrl: string;
  @Field()
  goalEmojiImageId: string;
  @Field()
  goalEmojiImageFilePath: string;
  @Field()
  progress: number;
  @Field()
  earnedPoints: number;
  @Field()
  requiredPoints: number;
  @Field()
  goalLevelBadgeColor: string;
}
export type ToolkitGoalData =
  | ToolkitGoalWithoutOptions
  | ToolkitGoalWithOptions
  | NormalHabitToolkitGoal;

export const ToolkitGoalData = createUnionType({
  name: 'ToolkitGoalData',
  types: () => [
    ToolkitGoalWithoutOptions,
    ToolkitGoalWithOptions,
    NormalHabitToolkitGoal,
  ],
  resolveType: (value) => {
    if ('completedSessions' in value) {
      return ToolkitGoalWithoutOptions;
    }
    if ('loggedData' in value) {
      return ToolkitGoalWithOptions;
    }
    if ('goalTitle' in value) {
      return NormalHabitToolkitGoal;
    }
    return undefined;
  },
});

@ArgsType()
export class GetToolkitArgs {
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field(() => String)
  id: string;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field(() => String, { nullable: true })
  schedule_id?: string;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  @Field(() => String, { nullable: true })
  session_date?: string;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field(() => String, { nullable: true })
  habit_id?: string;
}

export class ToolkitAudioFiles {
  audio_tool_kit_files: AudioToolKitFile[];
}
@ObjectType()
export class GetToolkitDetailsResponse {
  @Field(() => Schedule, { nullable: true })
  schedule?: Schedule;

  @Field(() => [ToolkitSelectedOptions], { nullable: true })
  selectedOptions?: [ToolkitSelectedOptions];

  @Field(() => [ToolkitOptions], { nullable: true })
  options?: Array<typeof ToolkitOptions>;

  @Field(() => Toolkit, { nullable: true })
  toolkit: Toolkit;

  @Field(() => ToolkitChallenge, { nullable: true })
  challenge?: ToolkitChallenge;

  @Field(() => ToolkitGoalData, { nullable: true })
  goalData?: ToolkitGoalData;

  @Field(() => String, {
    nullable: true,
    description: 'In audio toolkit, Use to save the played Audio files',
  })
  sessionId?: string;
}

export class AudioToolkitFilesAndSessionId {
  audioToolkitFiles: AudioToolkitFileWithStatus[];
  sessionId: string;
}
