import { ArgsType, Field, Int, ObjectType } from '@nestjs/graphql';
import { UserFeedPost } from './get-user-feed.dto';
import { GetChannelPostsArgs } from './get-channel-posts.dto';

@ArgsType()
export class GetDoctorChannelPostsArgs extends GetChannelPostsArgs {}

@ObjectType()
export class GetDoctorChannelPostsResponse {
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
