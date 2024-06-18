import { UserDonation } from '../users/users.dto';
import {
  ChannelPostBodyDto,
  ChannelPostReaction,
  PostLikeBody,
} from './channels.dto';
import { ChannelPostConversation } from './entities/channel-post-conversation.entity';
import { ChannelPostLikes } from './entities/channel-post-likes.entity';
import { ChannelPostReactionConversationLikes } from './entities/channel-post-reaction-conversation-likes.entity';
import { ChannelPostReactionLike } from './entities/channel-post-reaction-like.entity';
import { ChannelPostReactions } from './entities/channel-post-reactions.entity';
import { ChannelUserPost } from './entities/channel-user-posts.entity';
import { UserChannel } from './entities/user-channel.entity';

export enum ChannelsEvent {
  CHANNEL_FOLLOWED = '[CHANNELS] CHANNEL FOLLOWED',
  CHANNEL_POST_ADDED = '[CHANNELS]CHANNEL_POST_ADDED',
  CHANNEL_POST_UPDATED = '[CHANNELS] CHANNEL_POST_UPDATED',
  CHANNEL_POST_REACTION_ADDED = '[CHANNELS]CHANNEL_POST_REACTION_ADDED',
  CHANNEL_POST_REACTION_DISABLED = '[CHANNELS]CHANNEL_POST_REACTION_DISABLED',
  CHANNEL_POST_REACTION_REPLY_ADDED = '[CHANNELS]CHANNEL_POST_REACTION_REPLY_ADDED',
  CHANNEL_POST = '[CHANNELS] CHANNEL_POST',
  CHANNEL_POST_LIKED = '[CHANNELS] CHANNEL_POST_LIKED',
  CHANNEL_POST_THANK_YOU = '[CHANNELS] CHANNEL_POST_THANK_YOU',
  CHANNEL_UNFOLLOWED = '[CHANNELS] CHANNEL UNFOLLOWED',
  CHANNEL_POST_VIEWED = '[CHANNELS] CHANNEL POST VIEWED',
  CHANNEL_POST_DISABLED_BY_ADMIN = '[CHANNELS] CHANNEL_POST_DISABLED_BY_ADMIN',
  CHANNEL_POST_UNLIKED = '[CHANNELS] CHANNEL_POST_UNLIKED',
  CHANNEL_POST_REACTION_LIKED = '[CHANNELS] CHANNEL_POST_REACTION_LIKED',
  CHANNEL_POST_REACTION_UNLIKED = '[CHANNELS] CHANNEL_POST_REACTION_UNLIKED',
  CHANNEL_POST_REACTION_CONVERSATION_LIKED = '[CHANNELS] CHANNEL_POST_REACTION_CONVERSATION_LIKED',
  CHANNEL_POST_REACTION_CONVERSATION_UNLIKED = '[CHANNELS] CHANNEL_POST_REACTION_CONVERSATION_UNLIKED',
  CHANNEL_POST_REACTION_COUNT_UPDATED = '[CHANNELS] CHANNEL_POST_REACTION_COUNT_UPDATED',
  CHANNEL_POST_REACTION_REPLY_DISABLED = '[CHANNELS] CHANNEL_POST_REACTION_REPLY_DISABLED',
}

export class ChannelFollowedEvent {
  constructor(public userChannel: UserChannel) {}
}
export class ChannelPostAddedEvent {
  constructor(public channelPost: ChannelUserPost) {}
}
export class PostReactionAddedEvent {
  constructor(public channelPostReaction: ChannelPostReaction) {}
}

export class ChannelPostEvent {
  constructor(public channelPostBodyDto: ChannelPostBodyDto) {}
}
// export class PostReactionEvent {
//   constructor(public postReactionBody: PostReactionBody) {}
// }

export class PostLikedEvent {
  constructor(public postLikedBody: PostLikeBody) {}
}

export class PostThankYouEvent {
  constructor(public postThankYou: UserDonation) {}
}

export class ChannelUnfollowedEvent {
  constructor(public userChannel: UserChannel) {}
}

export class ChannelPostViewedEvent {
  constructor(public userId: string, public channelId: string) {}
}

export class ChannelPostDisabledByAdminEvent {
  constructor(public userId: string) {}
}

export class ChannelPostUpdatedEvent extends ChannelPostAddedEvent {}

export class ChannelPostLikeUpdatedEvent {
  constructor(public channelPostLike: ChannelPostLikes) {}
}

export class ChannelPostReactionLikeUpdatedEvent {
  constructor(public channelPostReactionLike: ChannelPostReactionLike) {}
}

export class ChannelConversationLikeUpdatedEvent {
  constructor(
    public channelPostReactionConversationLikes: ChannelPostReactionConversationLikes,
  ) {}
}

export class PostReactionUpdatedEvent {
  constructor(public channelPostReaction: ChannelPostReactions) {}
}

export class ReactionConversationUpdatedEvent {
  constructor(public ChannelPostconversation: ChannelPostConversation) {}
}
