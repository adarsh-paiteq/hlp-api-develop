import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { Users } from '@users/users.model';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { i18nValidationMessage } from '@core/modules/i18n-next';
import { PaginationArgs } from '@shared/dto/pagination-params.dto';

@ArgsType()
export class GetUserUnassignedTreatmentBuddiesArgs extends PaginationArgs {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field(() => String)
  treatmentId: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @Field(() => String, {
    nullable: true,
  })
  search?: string;
}

@ObjectType()
export class GetUserUnassignedTreatmentBuddiesResponse {
  @Field(() => [Users], { nullable: true })
  buddies: Users[];

  @Field(() => Boolean, { defaultValue: false })
  hasMore: boolean;
}
