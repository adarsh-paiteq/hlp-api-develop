import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { i18nValidationMessage } from '@core/modules/i18n-next';
import { SearchToolkitsArgs, SearchToolkitsResponse } from '../toolkits.model';

@ArgsType()
export class SearchUserToolkitsArgs extends SearchToolkitsArgs {
  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  userId: string;
}

@ObjectType()
export class SearchUserToolkitsResponse extends SearchToolkitsResponse {}
