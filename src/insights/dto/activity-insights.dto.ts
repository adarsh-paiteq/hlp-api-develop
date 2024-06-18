import { Field, ObjectType } from '@nestjs/graphql';
import { GraphQLInt } from 'graphql';

@ObjectType()
export class AverageActivity {
  @Field(() => GraphQLInt)
  steps: number;

  @Field(() => String)
  activityTime: string;
}

@ObjectType()
export class StepsVsMoodGraph {
  @Field(() => String)
  label: string;

  @Field(() => GraphQLInt)
  value: number;

  @Field(() => GraphQLInt, { nullable: true })
  emoji?: number;
}

@ObjectType()
export class ActivityVsMoodGraph extends StepsVsMoodGraph {}

@ObjectType()
export class StepsVsMood {
  @Field(() => [StepsVsMoodGraph], { nullable: 'items' })
  stepsVsMoodGraph: StepsVsMoodGraph[];

  @Field(() => String, { nullable: true })
  bestSteps?: string;
}

@ObjectType()
export class ActivityVsMood {
  @Field(() => [ActivityVsMoodGraph], { nullable: 'items' })
  activityVsMoodGraph: ActivityVsMoodGraph[];

  @Field(() => String, { nullable: true })
  bestActivityTime?: string;
}

@ObjectType()
export class ActivityInsights {
  @Field(() => AverageActivity)
  averageActivity: AverageActivity;

  @Field(() => StepsVsMood)
  stepsVsMood: StepsVsMood;

  @Field(() => ActivityVsMood)
  activityVsMood: ActivityVsMood;
}
