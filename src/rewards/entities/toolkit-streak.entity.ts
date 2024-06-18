import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ToolkitStreak {
  id: string;
  tool_kit: string;
  streak_count: number;
  streak_points: number;
  @Field(() => GraphQLISODateTime)
  created_at: Date;
  @Field(() => GraphQLISODateTime)
  updated_at: Date;
  sequence_number?: number;
}
