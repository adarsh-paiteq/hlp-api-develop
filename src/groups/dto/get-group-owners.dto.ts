import { ArgsType, Field, Int, ObjectType } from '@nestjs/graphql';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { i18nValidationMessage } from '@core/modules/i18n-next';
import { PaginationArgs } from '@shared/dto/pagination-params.dto';
import { Doctor } from '../../doctors/entities/doctors.entity';

@ArgsType()
export class GetGroupOwnersArgs extends PaginationArgs {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field()
  groupId: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @Field(() => String, {
    nullable: true,
  })
  text?: string;
}

@ObjectType()
export class GetGroupOwnersResponse {
  @Field(() => [GroupOwners], { nullable: true })
  groupOwners: GroupOwners[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  totalPage: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;
}

@ObjectType()
export class GroupOwners extends Doctor {}
