import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  ScheduleWithAnswers,
  ToolkitWithUnit,
  UserSchedule,
} from './get-dashboard.dto';
import { GetUserAgendaArgs } from './get-user-agenda.dto';
import { HabitDay } from '../entities/habit-days.dto';

@ObjectType()
export class UserHabit extends UserSchedule {
  @Field()
  day_id: string;

  @Field()
  habit_id?: string;

  @Field(() => Int)
  day: number;

  @Field()
  habit_name?: string;

  @Field()
  habit_tool_id: string;
}

/**
 * @description The @function getUserHabits() functions in the schedules controller use DTOs
 */
@ObjectType()
export class GetUserHabitArgs extends GetUserAgendaArgs {}

/**
 * @description The @function getUserHabits() functions in the schedules controller use DTOs
 */
@ObjectType()
export class GetUserHabitsResponse {
  @Field(() => [UserHabit], { nullable: false })
  habits: UserHabit[];

  has_more: boolean;
}

export class HabitScheduleWithAnswers extends ScheduleWithAnswers {
  habit_tool: ToolkitWithUnit;
  habit_day: HabitDay;
  habit_tool_id: string;
}
