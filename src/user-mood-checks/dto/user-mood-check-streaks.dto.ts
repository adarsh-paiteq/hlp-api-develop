import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsDateString } from 'class-validator';
import { GraphQLInt } from 'graphql';

@ArgsType()
export class GetUserMoodCheckStreakArgs {
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  @Field(() => String)
  date: string;
}

@ObjectType()
export class UserMoodCheckStreak {
  @Field(() => String)
  weekday: string;

  @Field(() => Boolean)
  is_completed: boolean;

  @Field(() => Number)
  day: number;
}

@ObjectType()
export class GetUserMoodCheckStreakResponse {
  @Field(() => [UserMoodCheckStreak], { nullable: false })
  weekdays: UserMoodCheckStreak[];

  @Field(() => GraphQLInt)
  streak: number;
}
