import {
  ArgsType,
  Field,
  GraphQLISODateTime,
  ObjectType,
} from '@nestjs/graphql';
import { PaginationArgs } from '@shared/dto/pagination-params.dto';
import { GraphQLInt } from 'graphql';

@ArgsType()
export class GetAllToolkitsHistoryArgs extends PaginationArgs {}

@ObjectType()
export class GetAllToolkitsHistory {
  @Field({ nullable: true })
  title?: string;

  @Field(() => GraphQLISODateTime)
  session_date: string;

  @Field(() => GraphQLInt, { nullable: true })
  emoji?: number;

  @Field(() => String)
  session_id: string;
}

@ObjectType()
export class GetAllToolkitsHistoryResponse {
  @Field(() => [GetAllToolkitsHistory])
  allToolkitsHistory: GetAllToolkitsHistory[];

  @Field(() => Boolean, { defaultValue: false })
  hasMore: boolean;
}
