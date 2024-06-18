import { ArgsType, Field, Int, ObjectType } from '@nestjs/graphql';
import { GetUserFeedArgs, UserFeedPost } from './get-user-feed.dto';

@ArgsType()
export class GetDoctorFeedArgs extends GetUserFeedArgs {}

@ObjectType()
export class GetDoctorFeedResponse {
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
