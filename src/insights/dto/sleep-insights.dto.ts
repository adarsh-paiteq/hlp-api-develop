import { Field, ObjectType } from '@nestjs/graphql';
import { StepsVsMoodGraph } from './activity-insights.dto';

@ObjectType()
export class SleepHourVsMoodGraph extends StepsVsMoodGraph {}

@ObjectType()
export class AverageSleep {
  @Field(() => String)
  inBedTime: string;

  @Field(() => String)
  wakeUpTime: string;

  @Field(() => String)
  sleepHours: string;

  @Field(() => String)
  deepSleep: string;
}

@ObjectType()
export class SleepHourVsMood {
  @Field(() => [SleepHourVsMoodGraph], { nullable: 'items' })
  sleepHourVsMoodGraph: SleepHourVsMoodGraph[];

  @Field(() => String, { nullable: true })
  bestSleepHours?: string;
}

@ObjectType()
export class SleepInsights {
  @Field(() => AverageSleep, { nullable: true })
  averageSleep: AverageSleep;

  @Field(() => [String], { nullable: 'items' })
  nightActivity: string[];

  @Field(() => SleepHourVsMood)
  sleepHourVsMood: SleepHourVsMood;
}

export const SLEET_TIME_FIELDS = {
  IN_BED_TIME: 'in_bed_time',
  WAKE_UP_TIME: 'wake_up_time',
} as const;

export type ObjectValues<T> = T[keyof T];

export type SleepTimeField = ObjectValues<typeof SLEET_TIME_FIELDS>;
