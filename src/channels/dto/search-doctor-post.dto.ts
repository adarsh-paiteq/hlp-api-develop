import { ArgsType, Field, Int, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';
import { PaginationArgs } from '@shared/dto/pagination-params.dto';
import { i18nValidationMessage } from '@core/modules/i18n-next';
import { UserFeedPost } from './get-user-feed.dto';

@ArgsType()
export class SearchDoctorPostsArgs extends PaginationArgs {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field(() => String, { description: `word to search in post messages` })
  text: string;
}

@ObjectType()
export class SearchDoctorPostsResponse {
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => [UserFeedPost], { nullable: 'items' })
  posts: UserFeedPost[];
}
