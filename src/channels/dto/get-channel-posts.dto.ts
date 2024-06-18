import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { UserFeedPost } from './get-user-feed.dto';
import { PaginationArgs } from '@shared/dto/pagination-params.dto';
import { i18nValidationMessage } from '@core/modules/i18n-next';

@ObjectType()
export class GetChannelPostsResponse {
  @Field(() => Boolean, {
    defaultValue: false,
    description: 'If more posts after this set',
  })
  has_more: boolean;

  @Field(() => [UserFeedPost], { nullable: 'items' })
  posts: UserFeedPost[];
}

@ArgsType()
export class GetChannelPostsArgs extends PaginationArgs {
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field(() => String, { description: 'id of the channel' })
  id: string;
}
