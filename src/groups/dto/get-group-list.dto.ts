import { ArgsType, Field, Int, ObjectType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';
import { i18nValidationMessage } from '@core/modules/i18n-next';
import { PaginationArgs } from '@shared/dto/pagination-params.dto';
import { Group } from '../entities/groups.entity';

@ArgsType()
export class GetGroupListArgs extends PaginationArgs {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @Field(() => String, {
    nullable: true,
  })
  text?: string;
}

@ObjectType()
export class GetGroupListResponse {
  @Field(() => [Group], { nullable: true })
  groups: Group[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  totalPage: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;
}
