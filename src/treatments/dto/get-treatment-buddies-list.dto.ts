import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field, Int, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationArgs } from '@shared/dto/pagination-params.dto';
import { Users } from '@users/users.model';

@ArgsType()
export class GetUnassignedTreatmentBuddiesArgs extends PaginationArgs {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field(() => String)
  treatmentId: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field(() => String)
  userId: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @Field(() => String, {
    nullable: true,
  })
  search?: string;
}

@ObjectType()
export class GetUnassignedTreatmentBuddiesResponse {
  @Field(() => [Users], { nullable: true })
  buddies: Users[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  totalPage: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;
}
