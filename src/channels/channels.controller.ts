import {
  FollowChannelBodyDto,
  ChannelPostBodyDto,
  PostLikeBodyDto,
} from './channels.dto';
import { ChannelsService } from './channels.service';
import { Body, Controller, Patch, Post } from '@nestjs/common';
import {
  UpdateChannelUserFeed,
  UpdateChannelUserFeedResponse,
} from './dto/update-channel-feed.dto';
import {
  AddChannelUserFeed,
  AddChannelUserFeedResponse,
} from './dto/add-channel-feed.dto';
import { Channel } from './entities/channel.entity';
import { UpdateLikesCountDto } from './dto/channel-post-likes.dto';
import { UpdateReactionCountDto } from './dto/channel.dto';
@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  /**
   * @deprecated Unused controller
   * it's migrated to updateUserChannel Resolver
   * And from app side thay are using migrated updateUserChannel Resolver
   */
  @Post('/follow')
  async followChannel(@Body() body: FollowChannelBodyDto): Promise<void> {
    return this.channelsService.followChannel(body.data);
  }

  /**
   * @description Triggered from user_channel_post Hasura Event Trigger
   * It's migrated in savePost And updatePost Resolver we need to emit CHANNEL_POST_ADDED and CHANNEL_POST_UPDATED event but app team is not using this migration
   */
  @Post('/post')
  async channelPost(@Body() body: ChannelPostBodyDto): Promise<void> {
    return this.channelsService.channelPost(body);
  }

  /**
   * @description Triggered from user_channel_post_reaction Hasura Event Trigger
   * It's migrated in channelPostReaction Resolver we need to emit CHANNEL_POST_REACTION_ADDED event but app team is not using this migration
   * Found duplication Event in Community module (channel_post_reactions Event which is to update total_reactions only)
   */
  // @Post('/reaction')
  // async postReaction(@Body() body: PostReactionBodyDto): Promise<void> {
  //   return this.channelsService.postReaction(body.data);
  // }

  /**
   * @description Triggered from channel_post_like Hasura Event Trigger
   * It's migrated in updatelikeChannelPost Resolver need to emit CHANNEL_POST_LIKED event but app team is not using this migration
   * Found duplication Event in Community module (channel_post_like Event which is to update total_likes only)
   */
  @Post('/post-like')
  async postLike(@Body() body: PostLikeBodyDto): Promise<void> {
    return this.channelsService.postLike(body.data);
  }

  /**
   * @description calculate followers of all channels and update total followers
   * It is used for testing purpose
   */
  @Patch('/update-followers-count')
  async updateChannelsFollowersCount(): Promise<Channel[]> {
    return this.channelsService.updateChannelsFollowersCount();
  }

  /**
   * @description updates the user channel feed for specific channel
   * It is used for testing purpose
   */
  @Post('/update-channel-feed')
  async updateUserChannelFeed(
    @Body() body: UpdateChannelUserFeed,
  ): Promise<UpdateChannelUserFeedResponse> {
    return this.channelsService.updateUserChannelFeed(body);
  }

  /**
   * @description add the user channel feed for specific channel
   * It is used for testing purpose
   */
  @Post('/add-channel-feed')
  async addUserChannelFeed(
    @Body() body: AddChannelUserFeed,
  ): Promise<AddChannelUserFeedResponse> {
    return this.channelsService.addChannelPostToUserChannelFeed(body);
  }

  /**
   * @description updates like count of post reaction and conversation
   * It is used for testing purpose
   */
  @Post('/update-likes-count')
  async updateLikesCount(@Body() body: UpdateLikesCountDto): Promise<string> {
    const { id, likeType } = body;
    return this.channelsService.updateLikesCount(id, likeType);
  }

  @Post('/test/update-reactions-count')
  async updateReactionCount(
    @Body() body: UpdateReactionCountDto,
  ): Promise<string> {
    return this.channelsService.updateReactionsCount(body);
  }
}
