import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';
import { GetChannelPostsResponse } from './get-channel-posts.dto';
import { PaginationArgs } from '@shared/dto/pagination-params.dto';
import { i18nValidationMessage } from '@core/modules/i18n-next';

@ArgsType()
export class SearchPostsArgs extends PaginationArgs {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field(() => String, { description: `word to search in post messages` })
  text: string;
}

@ObjectType()
export class SearchPostsResponse extends GetChannelPostsResponse {}
