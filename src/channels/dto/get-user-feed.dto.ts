import {
  ArgsType,
  Field,
  GraphQLISODateTime,
  Int,
  ObjectType,
} from '@nestjs/graphql';
import { Challenge } from '../../challenges/challenges.model';
import { Toolkit } from '../../toolkits/toolkits.model';
import { Users } from '../../users/users.model';
import { ChannelPostLikes } from '../entities/channel-post-likes.entity';
import {
  ChannelUserPost,
  ChannelUserPostStoryImage,
  PostType,
} from '../entities/channel-user-posts.entity';
import { PostImage } from '../entities/post-image.entity';
import { PostVideo } from '../entities/post-video.entity';
import { HasTags } from '../entities/posts-has-tag.entity';
import { PaginationArgs } from '@shared/dto/pagination-params.dto';
import { PollPostOption } from '../entities/poll-post-options.entity';
import { UserPollPostOption } from '../entities/user-poll-post.entity';

@ArgsType()
export class GetUserFeedArgs extends PaginationArgs {}

@ObjectType()
export class ChallengeWithToolkit extends Challenge {
  @Field(() => Toolkit)
  tool_kit: Toolkit;
}

@ObjectType()
export class UserFeedPost extends ChannelUserPost {
  @Field(() => [PostImage], { nullable: 'items' })
  post_images: PostImage[];

  @Field(() => [PostVideo], { nullable: 'items' })
  post_videos: PostVideo[];

  @Field(() => [ChallengeWithToolkit], { nullable: 'items' })
  admin_posts_challenges: ChallengeWithToolkit[];

  @Field(() => [Toolkit], { nullable: 'items' })
  admin_posts_tools_spotlights: Toolkit[];

  @Field(() => [Toolkit], { nullable: 'items' })
  admin_posts_tools_we_loves: Toolkit[];

  @Field(() => [ChannelPostLikes], { nullable: 'items' })
  channel_post_likes: ChannelPostLikes[];

  @Field(() => [HasTags], { nullable: 'items' })
  posts_hash_tags: HasTags[];

  users: Users[];

  //show_post: boolean;

  @Field(() => Users, { nullable: true })
  user: Users;

  @Field(() => GraphQLISODateTime)
  created_at: string;

  @Field(() => GraphQLISODateTime)
  updated_at: string;

  @Field(() => String, { nullable: true })
  user_id: string;

  @Field(() => PostType, { nullable: true })
  post_type: PostType;

  @Field(() => [ChannelUserPostStoryImage], { nullable: true })
  story_images?: ChannelUserPostStoryImage[];

  @Field(() => [PollPostOption])
  poll_options: PollPostOption[];

  @Field(() => UserPollPostOption, { nullable: true })
  selected_poll_option?: UserPollPostOption;

  @Field(() => Number, { defaultValue: 0 })
  votes: number;

  @Field(() => Int, { nullable: true })
  duration?: number;

  @Field(() => String, { nullable: true })
  durationUnit?: string;

  selected_poll_options: UserPollPostOption[];

  user_poll_post_options: PollPostOption[];

  end_date?: Date;
  @Field(() => Boolean)
  is_favourite_post: boolean;
}

@ObjectType()
export class GetUserFeedResponse {
  @Field(() => Boolean, {
    defaultValue: false,
    description: 'If more posts after this set',
  })
  hasMore: boolean;

  @Field(() => [UserFeedPost], { nullable: 'items' })
  posts: UserFeedPost[];
}
