import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { PaginationArgs } from '@shared/dto/pagination-params.dto';

@ObjectType()
export class GetGoalHistoryResponse {
  @Field(() => [GetGoalHistory])
  goalHistory: GetGoalHistory[];
  @Field(() => Boolean, { defaultValue: false })
  hasMore: boolean;
}

@ArgsType()
export class GetGoalHistoryArgs extends PaginationArgs {}
@ObjectType()
export class GetGoalHistory {
  @Field()
  title: string;

  @Field()
  date: string;

  @Field()
  total: number;

  @Field()
  completed: number;

  @Field()
  time: Date;

  @Field()
  schedule_id: string;
}
