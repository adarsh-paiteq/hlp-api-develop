import { Field, ObjectType, PickType } from '@nestjs/graphql';
import { GoalCategory } from '../entities/goal-categories.entity';
import { Goal } from '../goals.model';

@ObjectType()
export class GoalWithStatus extends Goal {
  @Field(() => Boolean)
  is_selected: boolean;
}

@ObjectType()
export class GoalCategoriesWithGoals extends PickType(GoalCategory, [
  'id',
  'title',
]) {
  @Field(() => [GoalWithStatus], { nullable: true })
  goals: GoalWithStatus[];
}

@ObjectType()
export class GetGoalCategoriesWithGoalsResponse {
  @Field(() => [GoalCategoriesWithGoals], { nullable: true })
  goalCategoriesWithGoals: GoalCategoriesWithGoals[];
}
