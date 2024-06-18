import { ArgsType, Field, Int, ObjectType } from '@nestjs/graphql';
import { PostReactionDetail, UserPostDetail } from './get-post-reactions.dto';
import { ChannelUserPostArgs } from './channel-user-post.dto';

@ArgsType()
export class ChannelDoctorPostArgs extends ChannelUserPostArgs {}
@ObjectType()
export class GetDoctorChannelPostAndItsReactionResponse {
  @Field(() => UserPostDetail)
  posts: UserPostDetail;
  @Field(() => [PostReactionDetail], { nullable: true })
  reactions: PostReactionDetail[];
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;
}
