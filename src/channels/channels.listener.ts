import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ChannelConversationLikeUpdatedEvent,
  ChannelFollowedEvent,
  ChannelPostAddedEvent,
  ChannelPostEvent,
  ChannelPostLikeUpdatedEvent,
  ChannelPostReactionLikeUpdatedEvent,
  ChannelPostUpdatedEvent,
  ChannelPostViewedEvent,
  ChannelsEvent,
  ChannelUnfollowedEvent,
  PostReactionAddedEvent,
  PostReactionUpdatedEvent,
  ReactionConversationUpdatedEvent,
} from './channels.event';
import { ChannelsQueue } from './channels.queue';
import { ChannelsService } from './channels.service';
import { ReactionType } from './dto/channel.dto';

@Injectable()
export class ChannelsListener {
  private readonly logger = new Logger(ChannelsListener.name);
  constructor(
    private readonly channelsQueue: ChannelsQueue,
    private readonly channelsService: ChannelsService,
  ) {}

  @OnEvent(ChannelsEvent.CHANNEL_POST)
  async channelPost(payload: ChannelPostEvent): Promise<void> {
    await this.channelsQueue.checkChannelPost(payload);
  }

  // /**
  //  * @description It is used for @function postReaction() function used in channel service.
  //  */
  // @OnEvent(ChannelsEvent.CHANNEL_POST_REACTION)
  // async channelPostReaction(payload: PostReactionEvent): Promise<void> {
  //   await this.channelsQueue.checkPostReaction(payload.postReactionBody);
  // }

  @OnEvent(ChannelsEvent.CHANNEL_FOLLOWED)
  async handleChannelFollowEvent(payload: ChannelFollowedEvent): Promise<void> {
    const { userChannel } = payload;
    await Promise.all([
      this.channelsQueue.updateChannelPostsToUserChannelFeed(userChannel),
      this.channelsQueue.saveLastPostCreatedDateInUserChannel(userChannel),
    ]);
  }

  @OnEvent(ChannelsEvent.CHANNEL_UNFOLLOWED)
  async handleChannelUnFollowEvent(
    payload: ChannelUnfollowedEvent,
  ): Promise<void> {
    const { userChannel } = payload;
    await this.channelsQueue.hideChannelPostsInUserChannelFeed(userChannel);
  }

  @OnEvent(ChannelsEvent.CHANNEL_POST_ADDED)
  async handleChannelPostAddedEvent(
    payload: ChannelPostAddedEvent,
  ): Promise<void> {
    const { channelPost } = payload;
    await this.channelsQueue.adChannelPostToUserChannelFeed(channelPost);
  }

  @OnEvent(ChannelsEvent.CHANNEL_POST_VIEWED)
  async handleChannelViewdEvent(
    payload: ChannelPostViewedEvent,
  ): Promise<void> {
    await this.channelsQueue.viewChannelPostInUserChannelFeed(payload);
  }

  @OnEvent(ChannelsEvent.CHANNEL_POST_UPDATED)
  async handleChannelPostUpdatedEvent(
    payload: ChannelPostUpdatedEvent,
  ): Promise<void> {
    try {
      const { channelPost } = payload;
      await this.channelsService.handleChannelPostUpdated(channelPost);
    } catch (error) {
      this.logger.error(
        `${this.handleChannelPostUpdatedEvent.name}:${error.stack}`,
      );
    }
  }

  @OnEvent(ChannelsEvent.CHANNEL_POST_UNLIKED)
  async handleChannelPostUnLikeCountEvent(
    payload: ChannelPostLikeUpdatedEvent,
  ): Promise<void> {
    await this.channelsQueue.handleChannelPostLikeCountEvent(payload);
  }

  @OnEvent(ChannelsEvent.CHANNEL_POST_LIKED)
  async handleChannelPostLikeCountEvent(
    payload: ChannelPostLikeUpdatedEvent,
  ): Promise<void> {
    await this.channelsQueue.handleChannelPostLikeCountEvent(payload);
  }

  @OnEvent(ChannelsEvent.CHANNEL_POST_REACTION_LIKED)
  async handleChannelPostReactionLikeCountEvent(
    payload: ChannelPostReactionLikeUpdatedEvent,
  ): Promise<void> {
    await this.channelsQueue.handleChannelPostReactionLikeCountEvent(payload);
  }

  @OnEvent(ChannelsEvent.CHANNEL_POST_REACTION_UNLIKED)
  async handleChannelPostReactionUnLikeCountEvent(
    payload: ChannelPostReactionLikeUpdatedEvent,
  ): Promise<void> {
    await this.channelsQueue.handleChannelPostReactionLikeCountEvent(payload);
  }

  @OnEvent(ChannelsEvent.CHANNEL_POST_REACTION_CONVERSATION_LIKED)
  async handleConversationLikeCountEvent(
    payload: ChannelConversationLikeUpdatedEvent,
  ): Promise<void> {
    await this.channelsQueue.handleConversationLikeCountEvent(payload);
  }

  @OnEvent(ChannelsEvent.CHANNEL_POST_REACTION_CONVERSATION_UNLIKED)
  async handleChannelReactionConversationUnLikeCountEvent(
    payload: ChannelConversationLikeUpdatedEvent,
  ): Promise<void> {
    await this.channelsQueue.handleConversationLikeCountEvent(payload);
  }

  /**
   *
   * @description When channel post reaction is added we will update the count of total reactions
   */
  @OnEvent(ChannelsEvent.CHANNEL_POST_REACTION_ADDED)
  async handleChannelPostReactionAddedEvent(
    payload: PostReactionAddedEvent,
  ): Promise<void> {
    this.logger.log(
      `update channel post reaction count ${JSON.stringify(payload)}`,
    );
    const data = {
      id: payload.channelPostReaction.post_id,
      reactionType: ReactionType.POST_REACTION,
    };
    await this.channelsQueue.addChannelPostReactionCountUpdateJob(data);
  }

  /**
   *
   * @description When channel post reaction is removed we will update the count of total reactions
   */
  @OnEvent(ChannelsEvent.CHANNEL_POST_REACTION_DISABLED)
  async handleChannelPostReactionDisabledEvent(
    payload: PostReactionUpdatedEvent,
  ): Promise<void> {
    this.logger.log(
      `update channel post reaction count ${JSON.stringify(payload)}`,
    );
    const data = {
      id: payload.channelPostReaction.post_id,
      reactionType: ReactionType.POST_REACTION,
    };
    await this.channelsQueue.addChannelPostReactionCountUpdateJob(data);
  }

  /**
   *
   * @description When channel post reaction conversation is added we will update the count of total reactions
   */
  @OnEvent(ChannelsEvent.CHANNEL_POST_REACTION_REPLY_ADDED)
  async handleChannelPostConversationAddedEvent(
    payload: ReactionConversationUpdatedEvent,
  ): Promise<void> {
    this.logger.log(
      `update channel post reaction conversation count ${JSON.stringify(
        payload,
      )}`,
    );
    const data = {
      id: payload.ChannelPostconversation.reaction_id,
      reactionType: ReactionType.POST_REACTION_CONVERSATION,
    };
    await this.channelsQueue.addChannelPostReactionConversationCountUpdateJob(
      data,
    );
  }

  /**
   *
   * @description When channel post reaction conversation is removed we will update the count of total reactions
   */
  @OnEvent(ChannelsEvent.CHANNEL_POST_REACTION_REPLY_DISABLED)
  async handleChannelPostConversationDisableEvent(
    payload: ReactionConversationUpdatedEvent,
  ): Promise<void> {
    this.logger.log(
      `update channel post reaction conversation count ${JSON.stringify(
        payload,
      )}`,
    );
    const data = {
      id: payload.ChannelPostconversation.reaction_id,
      reactionType: ReactionType.POST_REACTION_CONVERSATION,
    };
    await this.channelsQueue.addChannelPostReactionConversationCountUpdateJob(
      data,
    );
  }
}
