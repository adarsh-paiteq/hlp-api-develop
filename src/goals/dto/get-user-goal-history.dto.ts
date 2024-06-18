import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field, Int, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { PaginationArgs } from '@shared/dto/pagination-params.dto';
import { GetGoalHistory } from './get-goal-history.dto';

@ArgsType()
export class GetUserGoalHistoryArgs extends PaginationArgs {
  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  userId: string;
}

@ObjectType()
export class GetUserGoalHistoryResponse {
  @Field(() => [GetGoalHistory], { nullable: true })
  goalHistory: GetGoalHistory[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;
}
