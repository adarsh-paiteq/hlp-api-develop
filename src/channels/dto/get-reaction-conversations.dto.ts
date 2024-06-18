import { Field, ObjectType } from '@nestjs/graphql';
import { ChannelPostReactions } from '../entities/channel-post-reactions.entity';
import { ChannelPostReactionLike } from '../entities/channel-post-reaction-like.entity';
import { Users } from '../../users/users.model';
import { PostConversationWithUsers } from './get-post-reactions.dto';

@ObjectType()
export class ReactionWithConversations extends ChannelPostReactions {
  @Field(() => [ChannelPostReactionLike], { nullable: true })
  channel_post_reactions_likes: ChannelPostReactionLike[];

  @Field(() => Users)
  users: Users;

  @Field(() => [PostConversationWithUsers], { nullable: true })
  channel_post_reactions_conversations: PostConversationWithUsers[];

  @Field(() => Boolean)
  is_favourite_post_reaction: boolean;
}

@ObjectType()
export class GetReactionsConversationResponse {
  @Field(() => Boolean, {
    defaultValue: false,
    description: 'If more conversations after this set',
  })
  has_more: boolean;

  @Field(() => ReactionWithConversations)
  reactionConversations: ReactionWithConversations;
}
