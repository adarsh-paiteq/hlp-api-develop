import { ArgsType, Field, Int } from '@nestjs/graphql';
import { IsNumber, IsOptional } from 'class-validator';
import { GraphQLInt } from 'graphql';

@ArgsType()
export class PaginationArgs {
  @IsNumber()
  @IsOptional()
  @Field(() => Int, {
    nullable: true,
    defaultValue: 16,
    description: 'default 16',
  })
  limit = 16;

  @IsNumber()
  @IsOptional()
  @Field(() => GraphQLInt, {
    nullable: true,
    defaultValue: 1,
    description: 'default 1',
  })
  page = 1;
}
