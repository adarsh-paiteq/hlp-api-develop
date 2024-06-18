import { Field, ObjectType, PickType } from '@nestjs/graphql';
import { GraphQLBoolean, GraphQLInt } from 'graphql';
import { Toolkit } from '../../toolkits/toolkits.model';
import { InsightRange } from './insights.dto';

@ObjectType()
export class MoodInsightsStats {
  @Field(() => GraphQLInt)
  moodEntries: number;

  @Field(() => GraphQLInt)
  longestStreak: number;
}

@ObjectType()
export class MoodInsightsChart {
  @Field(() => [MoodChartData])
  chartData: MoodChartData[];

  @Field(() => GraphQLBoolean)
  isEmpty: boolean;
}

@ObjectType()
export class MoodChartData {
  @Field(() => String)
  label: string;

  @Field(() => GraphQLInt, { nullable: true })
  value?: number;
}

@ObjectType()
export class AvegrageMood {
  @Field(() => GraphQLInt)
  label: number;

  @Field(() => String)
  value: string;
}

@ObjectType()
export class AvegrageDailyMoodGraph {
  @Field(() => String)
  label: string;

  @Field(() => GraphQLInt, { nullable: true })
  value?: number;
}

export class DailyMoodBarGraph {
  label: string;
  value: number;
}

@ObjectType()
export class AvegrageDailyMood {
  @Field(() => [AvegrageDailyMoodGraph], { nullable: 'items' })
  dailyMoodGraph: AvegrageDailyMoodGraph[];

  @Field(() => String, { nullable: true })
  bestDayOfWeek?: string;
}

@ObjectType()
export class MedicationVsMood {
  @Field(() => GraphQLInt)
  label: number;

  @Field(() => String)
  value: string;
}

@ObjectType()
export class MoodInsights {
  @Field(() => MoodInsightsStats)
  stats: MoodInsightsStats;

  @Field(() => MoodInsightsChart)
  moodChart: MoodInsightsChart;

  @Field(() => [AvegrageMood], { nullable: 'items' })
  averageMood: AvegrageMood[];

  @Field(() => AvegrageDailyMood)
  averageDailyMood: AvegrageDailyMood;

  @Field(() => [String], { nullable: 'items' })
  positiveFeelings: string[];

  @Field(() => [String], { nullable: 'items' })
  negativeFeelings: string[];

  @Field(() => [Toolkit], { nullable: 'items' })
  effectiveTools: Toolkit[];

  @Field(() => [MedicationVsMood], { nullable: 'items' })
  medicationVsMood: MedicationVsMood[];
}

export class Feelings extends PickType(MoodInsights, [
  'positiveFeelings',
  'negativeFeelings',
]) {}

export class FeelingsCount {
  awful: number;
  bad: number;
  mwahh: number;
  good: number;
  amazing: number;
}

export const getMoodChartDateField = new Map<InsightRange, string>([
  [InsightRange.WEEK, 'ISODOW'],
  [InsightRange.MONTH, 'DAY'],
  [InsightRange.YEAR, 'MONTH'],
]);

export const shortWeekDays = [
  'short_mon',
  'short_tu',
  'short_we',
  'short_th',
  'short_fr',
  'short_sa',
  'short_su',
];

export const moodRankings = [1, 2, 3, 4, 5];
export const longWeekDays = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];
