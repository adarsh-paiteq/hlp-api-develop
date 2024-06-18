import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { i18nValidationMessage } from '@core/modules/i18n-next';
import { PaginationArgs } from '@shared/dto/pagination-params.dto';
import { GetUserResponse } from '../../doctors/dto/search-users.dto';

@ArgsType()
export class GetUserListArgs extends PaginationArgs {
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
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
export class GetUserListResponse extends GetUserResponse {}
