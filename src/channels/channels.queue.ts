import { defaultJobOptions } from '@core/configs/bull.config';
import { BullModule, BullModuleOptions, InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { FollowChannelBody } from './channels.dto';
import {
  ChannelConversationLikeUpdatedEvent,
  ChannelPostEvent,
  ChannelPostLikeUpdatedEvent,
  ChannelPostReactionLikeUpdatedEvent,
  ChannelPostViewedEvent,
} from './channels.event';
import { ChannelUserPost } from './entities/channel-user-posts.entity';
import { UserChannel } from './entities/user-channel.entity';
import { UpdateReactionCountDto } from './dto/channel.dto';

export const CHANNELS_QUEUE = 'channels';

export const channelsQueueConfig: BullModuleOptions = {
  name: CHANNELS_QUEUE,
  defaultJobOptions: defaultJobOptions,
};

export const registerChannelsQueue =
  BullModule.registerQueueAsync(channelsQueueConfig);

export enum ChannelsJob {
  USER_CHANNEL_UPDATED = '[CHANNELS] USER CHANNEL UPDATED',
  CHANNEL_POST = '[CHANNELS] CHANNEL_POST',
  CHANNEL_POST_REACTION = '[CHANNELS] CHANNEL_POST_REACTION ',
  UPDATE_CHANNEL_FOLLOWERS_COUNT = '[CHANNELS] UPDATE_CHANNEL_FOLLOWERS_COUNT',
  ADD_CHANNEL_POSTS_TO_USER_CHANNEL_FEED = '[CHANNELS] ADD_CHANNEL_POSTS_TO_USER_CHANNEL_FEED',
  UPDATE_CHANNEL_POSTS_TO_USER_CHANNEL_FEED = '[CHANNELS] UPDATE_CHANNEL_POSTS_TO_USER_CHANNEL_FEED',
  HIDE_CHANNEL_POSTS_IN_USER_CHANNEL_FEED = '[CHANNELS] HIDE_CHANNEL_POSTS_IN_USER_CHANNEL_FEED',
  SAVE_LAST_POST_CREATED_DATE_IN_USER_CHANNEL = '[CHANNELS] SAVE_LAST_POST_CREATED_DATE_IN_USER_CHANNEL',
  VIEW_CHANNEL_POST_IN_USER_CHANNEL_FEED = '[CHANNEL] VIEW CHANNEL POST IN USER CHANNEL FEED',
  UPDATE_CHANNEL_POST_LIKES_COUNT = '[CHANNELS] UPDATE_CHANNEL_POST_LIKES_COUNT',
  UPDATE_CHANNEL_POST_REACTION_LIKES_COUNT = '[CHANNELS] UPDATE_CHANNEL_POST_REACTION_LIKES_COUNT',
  UPDATE_CHANNEL_POST_REACTION_CONVERSATION_LIKES_COUNT = '[CHANNELS] UPDATE_CHANNEL_POST_REACTION_CONVERSATION_LIKES_COUNT',
  UPDATE_CHANNEL_POST_REACTION_COUNT = '[CHANNELS] UPDATE_CHANNEL_POST_REACTION_COUNT',
  UPDATE_CHANNEL_POST_REACTION_CONVERSATION_COUNT = '[CHANNELS] UPDATE_CHANNEL_POST_REACTION_CONVERSATION_COUNT',
}

@Injectable()
export class ChannelsQueue {
  constructor(
    @InjectQueue(CHANNELS_QUEUE) private readonly channelsQueue: Queue,
  ) {}

  async userChannelUpdated(
    followChannelBody: FollowChannelBody,
  ): Promise<void> {
    await this.channelsQueue.add(
      ChannelsJob.USER_CHANNEL_UPDATED,
      followChannelBody,
    );
  }

  async updateChannelsFollowersCount(channelId: string): Promise<void> {
    await this.channelsQueue.add(
      ChannelsJob.UPDATE_CHANNEL_FOLLOWERS_COUNT,
      channelId,
    );
  }

  async checkChannelPost(payload: ChannelPostEvent): Promise<unknown> {
    return this.channelsQueue.add(ChannelsJob.CHANNEL_POST, payload);
  }

  // /**
  //  * @description It is used for  CHANNEL_POST_REACTION event used in channel listener.
  //  */
  // async checkPostReaction(
  //   postReactionBody: PostReactionBody,
  // ): Promise<unknown> {
  //   return this.channelsQueue.add(
  //     ChannelsJob.CHANNEL_POST_REACTION,
  //     postReactionBody,
  //   );
  // }

  async updateChannelPostsToUserChannelFeed(
    payload: UserChannel,
  ): Promise<void> {
    await this.channelsQueue.add(
      ChannelsJob.UPDATE_CHANNEL_POSTS_TO_USER_CHANNEL_FEED,
      payload,
    );
  }
  async hideChannelPostsInUserChannelFeed(payload: UserChannel): Promise<void> {
    await this.channelsQueue.add(
      ChannelsJob.HIDE_CHANNEL_POSTS_IN_USER_CHANNEL_FEED,
      payload,
    );
  }

  async saveLastPostCreatedDateInUserChannel(
    payload: UserChannel,
  ): Promise<void> {
    await this.channelsQueue.add(
      ChannelsJob.SAVE_LAST_POST_CREATED_DATE_IN_USER_CHANNEL,
      payload,
    );
  }

  async adChannelPostToUserChannelFeed(
    payload: ChannelUserPost,
  ): Promise<void> {
    await this.channelsQueue.add(
      ChannelsJob.ADD_CHANNEL_POSTS_TO_USER_CHANNEL_FEED,
      payload,
    );
  }

  async viewChannelPostInUserChannelFeed(
    payload: ChannelPostViewedEvent,
  ): Promise<void> {
    await this.channelsQueue.add(
      ChannelsJob.VIEW_CHANNEL_POST_IN_USER_CHANNEL_FEED,
      payload,
    );
  }

  async handleChannelPostLikeCountEvent(
    payload: ChannelPostLikeUpdatedEvent,
  ): Promise<void> {
    await this.channelsQueue.add(
      ChannelsJob.UPDATE_CHANNEL_POST_LIKES_COUNT,
      payload,
    );
  }

  async handleChannelPostReactionLikeCountEvent(
    payload: ChannelPostReactionLikeUpdatedEvent,
  ): Promise<void> {
    await this.channelsQueue.add(
      ChannelsJob.UPDATE_CHANNEL_POST_REACTION_LIKES_COUNT,
      payload,
    );
  }

  async handleConversationLikeCountEvent(
    payload: ChannelConversationLikeUpdatedEvent,
  ): Promise<void> {
    await this.channelsQueue.add(
      ChannelsJob.UPDATE_CHANNEL_POST_REACTION_CONVERSATION_LIKES_COUNT,
      payload,
    );
  }

  async addChannelPostReactionCountUpdateJob(
    payload: UpdateReactionCountDto,
  ): Promise<void> {
    await this.channelsQueue.add(
      ChannelsJob.UPDATE_CHANNEL_POST_REACTION_COUNT,
      payload,
    );
  }

  async addChannelPostReactionConversationCountUpdateJob(
    payload: UpdateReactionCountDto,
  ): Promise<void> {
    await this.channelsQueue.add(
      ChannelsJob.UPDATE_CHANNEL_POST_REACTION_CONVERSATION_COUNT,
      payload,
    );
  }
}
