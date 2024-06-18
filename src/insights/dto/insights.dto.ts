import { ArgsType, Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { GraphQLInt } from 'graphql';
import { GoalLevelDto } from '../../goals/dto/goal-levels.dto';
import { ActivityInsights } from './activity-insights.dto';
import { MoodInsights, MoodInsightsChart } from './mood-insights.dto';
import { SleepInsights } from './sleep-insights.dto';
import { i18nValidationMessage } from '@core/modules/i18n-next';

export enum InsightRange {
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  YEAR = 'YEAR',
}
registerEnumType(InsightRange, { name: 'InsightRange' });

@ObjectType()
export class Insights {
  @Field(() => [GoalLevelDto], { nullable: 'items' })
  goalLevels: (GoalLevelDto | undefined)[];

  @Field(() => MoodInsightsChart)
  moodChart: MoodInsightsChart;

  @Field(() => GraphQLInt)
  averageSteps: number;

  @Field(() => String)
  averageInBedTime: string;
}

@ObjectType()
export class GetInsightsResponse {
  @Field(() => Insights)
  insights: Insights;
}

@ArgsType()
export class GetMoodInsightsArgsDto {
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field(() => String)
  date: string;

  @IsEnum(InsightRange, { message: i18nValidationMessage('is_enum') })
  @Field(() => InsightRange, {
    nullable: false,
    description: `InsightRange must be ${Object.values(InsightRange)}`,
  })
  range: InsightRange;

  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @Field(() => String, { nullable: true })
  toolkitId?: string;
}

@ObjectType()
export class GetMoodInsightsResponse {
  @Field(() => InsightRange, { nullable: true })
  range: InsightRange;

  @Field(() => MoodInsights, { nullable: true })
  moodInsights: MoodInsights;
}

@ArgsType()
export class GetSleepInsightsArgsDto extends GetMoodInsightsArgsDto {}

@ObjectType()
export class GetSleepInsightsResponse {
  @Field(() => InsightRange, { nullable: true })
  range: InsightRange;

  @Field(() => SleepInsights, { nullable: true })
  sleepInsights: SleepInsights;
}

@ArgsType()
export class GetActivityInsightsArgsDto extends GetMoodInsightsArgsDto {}

@ObjectType()
export class GetActivityInsightsResponse {
  @Field(() => InsightRange, { nullable: true })
  range: InsightRange;

  @Field(() => ActivityInsights, { nullable: true })
  activityInsights: ActivityInsights;
}
