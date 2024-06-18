import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import Bull from 'bull';
import { defaultWorkersConcurrency } from '@core/configs/bull.config';
import { FollowChannelBody } from './channels.dto';
import { ChannelsJob, CHANNELS_QUEUE } from './channels.queue';
import { ChannelsService } from './channels.service';
import { ProcessorLogger } from '../core/helpers/processor-logging.helper';
import { UserChannel } from './entities/user-channel.entity';
import { ChannelUserPost } from './entities/channel-user-posts.entity';
import {
  ChannelConversationLikeUpdatedEvent,
  ChannelPostEvent,
  ChannelPostLikeUpdatedEvent,
  ChannelPostReactionLikeUpdatedEvent,
  ChannelPostViewedEvent,
} from './channels.event';
import { LikeType, UpdateReactionCountDto } from './dto/channel.dto';

@Processor(CHANNELS_QUEUE)
export class ChannelsProcessor extends ProcessorLogger {
  readonly logger = new Logger(ChannelsProcessor.name);
  constructor(private readonly channelsService: ChannelsService) {
    super();
  }

  @Process({
    name: ChannelsJob.USER_CHANNEL_UPDATED,
    concurrency: defaultWorkersConcurrency,
  })
  async userChannelUpdated(job: Bull.Job<FollowChannelBody>): Promise<string> {
    const { data: followChannelBody } = job;
    try {
      const { response } = await this.channelsService.userChannelUpdated(
        followChannelBody,
      );
      this.logger.log(response);
      return response;
    } catch (error) {
      this.logger.error(`${this.userChannelUpdated.name}:${error.stack}`);
      throw error;
    }
  }

  @Process({
    name: ChannelsJob.CHANNEL_POST,
    concurrency: defaultWorkersConcurrency,
  })
  async channelPost(job: Bull.Job<ChannelPostEvent>): Promise<string> {
    const {
      data: { channelPostBodyDto },
    } = job;
    try {
      const { response } = await this.channelsService.channelPostHandler(
        channelPostBodyDto,
      );
      this.logger.log(response);
      return response;
    } catch (error) {
      this.logger.error(`${this.channelPost.name}:${error.stack}`);
      throw error;
    }
  }

  // /**
  //  * @description It is used for  CHANNEL_POST_REACTION event used in channel queue.
  //  */
  // @Process({
  //   name: ChannelsJob.CHANNEL_POST_REACTION,
  //   concurrency: defaultWorkersConcurrency,
  // })
  // async postReaction(job: Bull.Job<PostReactionBody>): Promise<string> {
  //   const { data: postReactionBody } = job;
  //   try {
  //     const { response } = await this.channelsService.postReactionHandler(
  //       postReactionBody,
  //     );
  //     this.logger.log(response);
  //     return response;
  //   } catch (error) {
  //     this.logger.error(`${this.postReaction.name}:${error.stack}`);
  //     throw error;
  //   }
  // }

  @Process({
    name: ChannelsJob.UPDATE_CHANNEL_FOLLOWERS_COUNT,
    concurrency: defaultWorkersConcurrency,
  })
  async updateChannelFollowersCount(job: Bull.Job<string>): Promise<string> {
    try {
      const { data: channelId } = job;
      const message = await this.channelsService.updateChannelFollowers(
        channelId,
      );
      return message;
    } catch (error) {
      this.logger.error(
        `${this.updateChannelFollowersCount.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: ChannelsJob.UPDATE_CHANNEL_POSTS_TO_USER_CHANNEL_FEED,
    concurrency: defaultWorkersConcurrency,
  })
  async updateChannelPostsToUserChannelFeed(
    job: Bull.Job<UserChannel>,
  ): Promise<string> {
    const { data } = job;
    const result = await this.channelsService.updateUserChannelFeed({
      userId: data.user_id,
      channelId: data.channel_id,
    });
    return JSON.stringify(result);
  }

  @Process({
    name: ChannelsJob.SAVE_LAST_POST_CREATED_DATE_IN_USER_CHANNEL,
    concurrency: defaultWorkersConcurrency,
  })
  async saveLastPostCreatedDateInUserChannel(
    job: Bull.Job<UserChannel>,
  ): Promise<string> {
    const { data } = job;
    const result =
      await this.channelsService.saveLastPostCreatedDateInUserChannel(
        data.user_id,
        data.channel_id,
      );
    this.logger.log(result);
    return result;
  }

  @Process({
    name: ChannelsJob.HIDE_CHANNEL_POSTS_IN_USER_CHANNEL_FEED,
    concurrency: defaultWorkersConcurrency,
  })
  async hideChannelPostsInUserChannelFeed(
    job: Bull.Job<UserChannel>,
  ): Promise<string> {
    const { data } = job;
    this.logger.log(`${data.channel_id}`);
    return this.channelsService.hideUserChannelFeed(
      data.user_id,
      data.channel_id,
    );
  }

  @Process({
    name: ChannelsJob.ADD_CHANNEL_POSTS_TO_USER_CHANNEL_FEED,
    concurrency: defaultWorkersConcurrency,
  })
  async addChannelPostsToUserChannelFeed(
    job: Bull.Job<ChannelUserPost>,
  ): Promise<string> {
    const { data } = job;
    const result = await this.channelsService.addChannelPostToUserChannelFeed({
      postId: data.id,
      channelId: data.channel_id,
    });
    return JSON.stringify(result);
  }

  @Process({
    name: ChannelsJob.VIEW_CHANNEL_POST_IN_USER_CHANNEL_FEED,
    concurrency: defaultWorkersConcurrency,
  })
  async viewChannelPostInUserChannelFeed(
    job: Bull.Job<ChannelPostViewedEvent>,
  ): Promise<string> {
    const { data } = job;
    const result = await this.channelsService.viewChannelPostInUserChannelFeed(
      data.userId,
      data.channelId,
    );
    return JSON.stringify(result);
  }

  @Process({
    name: ChannelsJob.UPDATE_CHANNEL_POST_LIKES_COUNT,
    concurrency: defaultWorkersConcurrency,
  })
  async updateChannelPostLikesCount(
    job: Bull.Job<ChannelPostLikeUpdatedEvent>,
  ): Promise<string> {
    const {
      data: { channelPostLike },
    } = job;
    const result = await this.channelsService.updateLikesCount(
      channelPostLike.post_id,
      LikeType.POST_LIKE,
    );
    return JSON.stringify(result);
  }

  @Process({
    name: ChannelsJob.UPDATE_CHANNEL_POST_REACTION_LIKES_COUNT,
    concurrency: defaultWorkersConcurrency,
  })
  async updateChannelPostReactionLikesCount(
    job: Bull.Job<ChannelPostReactionLikeUpdatedEvent>,
  ): Promise<string> {
    const {
      data: { channelPostReactionLike },
    } = job;
    const result = await this.channelsService.updateLikesCount(
      channelPostReactionLike.reaction_id,
      LikeType.REACTION_LIKE,
    );
    return JSON.stringify(result);
  }

  @Process({
    name: ChannelsJob.UPDATE_CHANNEL_POST_REACTION_CONVERSATION_LIKES_COUNT,
    concurrency: defaultWorkersConcurrency,
  })
  async updateChannelConversationLikesCount(
    job: Bull.Job<ChannelConversationLikeUpdatedEvent>,
  ): Promise<string> {
    const {
      data: { channelPostReactionConversationLikes },
    } = job;
    const result = await this.channelsService.updateLikesCount(
      channelPostReactionConversationLikes.conversation_id,
      LikeType.CONVERSATION_LIKE,
    );
    return JSON.stringify(result);
  }

  @Process({
    name: ChannelsJob.UPDATE_CHANNEL_POST_REACTION_COUNT,
    concurrency: defaultWorkersConcurrency,
  })
  async updateChannelPostReactionCount(
    job: Bull.Job<UpdateReactionCountDto>,
  ): Promise<string> {
    const { data } = job;
    return this.channelsService.updateReactionsCount(data);
  }

  @Process({
    name: ChannelsJob.UPDATE_CHANNEL_POST_REACTION_CONVERSATION_COUNT,
    concurrency: defaultWorkersConcurrency,
  })
  async updatePostReactionConversationCount(
    job: Bull.Job<UpdateReactionCountDto>,
  ): Promise<string> {
    const { data } = job;
    return this.channelsService.updateReactionsCount(data);
  }
}
