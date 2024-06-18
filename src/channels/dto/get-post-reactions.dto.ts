import { ObjectType, Field, GraphQLISODateTime } from '@nestjs/graphql';
import { AdminPostRead } from '../../admin-post-reads/entities/admin-post-read.entity';
import { Toolkit } from '../../toolkits/toolkits.model';
import { Users } from '../../users/users.model';
import { ChannelPostConversation } from '../entities/channel-post-conversation.entity';
import { ChannelPostLikes } from '../entities/channel-post-likes.entity';
import { ChannelPostReactionConversationLikes } from '../entities/channel-post-reaction-conversation-likes.entity';
import { ChannelPostReactionLike } from '../entities/channel-post-reaction-like.entity';
import { ChannelPostReactions } from '../entities/channel-post-reactions.entity';
import { PostImage } from '../entities/post-image.entity';
import { PostVideo } from '../entities/post-video.entity';
import { HasTags } from '../entities/posts-has-tag.entity';
import { ChallengeWithToolkit } from './get-user-feed.dto';
import { ChannelUserPost } from '../entities/channel-user-posts.entity';

@ObjectType()
export class UserPostDetail extends ChannelUserPost {
  @Field(() => [PostImage], { nullable: true })
  post_images: PostImage[];

  @Field(() => [PostVideo], { nullable: true })
  post_videos: PostVideo[];

  @Field(() => [AdminPostRead], { nullable: true })
  admin_post_reads: AdminPostRead[];

  @Field(() => [ChallengeWithToolkit], { nullable: true })
  admin_posts_challenges: ChallengeWithToolkit[];

  @Field(() => [Toolkit], { nullable: true })
  admin_posts_tools_spotlights: Toolkit[];

  @Field(() => [Toolkit], { nullable: true })
  admin_posts_tools_we_loves: Toolkit[];

  @Field(() => [ChannelPostLikes], { nullable: true })
  channel_post_likes: ChannelPostLikes[];

  @Field(() => [HasTags], { nullable: true })
  posts_hash_tags: HasTags[];

  @Field(() => Users)
  users: Users;

  @Field(() => GraphQLISODateTime)
  created_at: string;

  @Field(() => GraphQLISODateTime)
  updated_at: string;

  @Field(() => Boolean)
  is_favourite_post: boolean;
}

@ObjectType()
export class PostConversationWithUsers extends ChannelPostConversation {
  @Field(() => Users)
  users: Users;

  @Field(() => Boolean)
  is_favourite_conversation: boolean;

  @Field(() => [ChannelPostReactionConversationLikes], { nullable: true })
  channel_post_reactions_conversations_likes: ChannelPostReactionConversationLikes[];
}

@ObjectType()
export class PostReactionDetail extends ChannelPostReactions {
  @Field(() => [PostConversationWithUsers], { nullable: true })
  channel_post_reactions_conversations: PostConversationWithUsers[];

  @Field(() => [ChannelPostReactionLike], { nullable: true })
  channel_post_reactions_likes: ChannelPostReactionLike[];

  @Field(() => Users)
  users: Users;

  @Field(() => Boolean)
  is_favourite_post_reaction: boolean;
}

@ObjectType()
export class GetChannelPostAndItsReactionResponse {
  @Field(() => UserPostDetail)
  posts: UserPostDetail;
  @Field(() => [PostReactionDetail], { nullable: true })
  reactions: PostReactionDetail[];
  @Field(() => Boolean, {
    defaultValue: false,
    description: 'If more reactions after this set',
  })
  has_more: boolean;
}
