import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DateTime } from 'luxon';
import { HasuraEventTriggerOperation } from '../utils/utils.dto';
import { RewardsRepo } from '../rewards/rewards.repo';
import { Users } from '../users/users.model';
import {
  FollowChannelBody,
  Response,
  PostLikeBody,
  ChannelPostBodyDto,
} from './channels.dto';
import {
  ChannelFollowedEvent,
  ChannelPostAddedEvent,
  ChannelPostEvent,
  PostReactionAddedEvent,
  ChannelsEvent,
  ChannelUnfollowedEvent,
  ChannelPostViewedEvent,
  ChannelPostUpdatedEvent,
  ChannelPostDisabledByAdminEvent,
  ChannelPostLikeUpdatedEvent,
  ChannelPostReactionLikeUpdatedEvent,
  ChannelConversationLikeUpdatedEvent,
  PostReactionUpdatedEvent,
  ReactionConversationUpdatedEvent,
} from './channels.event';
import {
  GetChannelsResponse,
  OperationTypes,
  PayloadImage,
  PayloadVideo,
  PostUpdateResponse,
  SavePostImagesAndVideo,
  UpdatePostPayload,
} from './channels.model';
import { ChannelsQueue } from './channels.queue';
import { ChannelsRepo } from './channels.repo';
import {
  AddChannelUserFeed,
  AddChannelUserFeedResponse,
} from './dto/add-channel-feed.dto';
import { ChannelPostLikesArgs } from './dto/channel-post-likes.dto';
import {
  ChannelPostReactionConversationLikeDto,
  ChannelPostReactionConversationLikeInput,
} from './dto/channel-post-reaction-conversation-likes.dto';
import {
  ChannelPostReactionConversationDto,
  ChannelPostReactionConversationInput,
  PostReactionConversationArgs,
} from './dto/channel-post-reaction-conversation.dto';
import { ChannelPostReactionLikeInput } from './dto/channel-post-reaction-likes.dto';
import {
  ChannelUserPostArgs,
  PostWithImagesResponse,
  SaveUserPostInput,
  UserPostInput,
  UserPostData,
  UpdatePostWithImageInput,
  PostImageDto,
} from './dto/channel-user-post.dto';
import {
  ChannelPostReactionInput,
  PostReactionDto,
  PostReactionArgs,
} from './dto/channel-user-reaction.dto';
import {
  UserReportedPostInput,
  UserReportedReactionConversationInput,
  UserReportedReactionInput,
  ReportedReactionConversation,
  ReportedPost,
  ReportedReaction,
  UpdateReactionCountDto,
  likeTable,
  likeUpdateTable,
  tableFieldName,
} from './dto/channel.dto';
import {
  FavouriteConversationDto,
  FavouriteConversationInput,
} from './dto/favourite-converasation.dto';
import {
  GetFavouritePostsResponse,
  UpdateFavouritePostDto,
} from './dto/favourite-posts.dto';
import {
  FavouriteReactionDto,
  FavouriteReactionInput,
} from './dto/favourite-reaction.dto';
import {
  ChannelDetailDto,
  ChannelPostFilter,
  GetChannelDetailsResponse,
} from './dto/get-channel-details.dto';
import {
  GetChannelPostsArgs,
  GetChannelPostsResponse,
} from './dto/get-channel-posts.dto';
import { GetMyChannelResponse } from './dto/get-my-channels.dto';
import { GetMyGroupsResponse } from './dto/get-my-groups.dto';
import { GetUserChannelsTimelineResponse } from './dto/get-user-channels-timeline.dto';
import {
  GetUserFeedArgs,
  GetUserFeedResponse,
  UserFeedPost,
} from './dto/get-user-feed.dto';
import {
  UpdateChannelUserFeed,
  UpdateChannelUserFeedResponse,
} from './dto/update-channel-feed.dto';
import { UpdateUserChannelArgsDto } from './dto/update-user-channel.dto';
import {
  ChannelUserListArgs,
  GetChannelUserListResponse,
  UserChannelArgs,
  UserFollowChannelStatusArgs,
} from './dto/user-channels.dto';
import { ChannelPostConversation } from './entities/channel-post-conversation.entity';
import { ChannelPostLikes } from './entities/channel-post-likes.entity';
import { ChannelPostReactionConversationLikes } from './entities/channel-post-reaction-conversation-likes.entity';
import { ChannelPostReactionLike } from './entities/channel-post-reaction-like.entity';
import { ChannelPostReactions } from './entities/channel-post-reactions.entity';
import { ChannelUserPost } from './entities/channel-user-posts.entity';
import { Channel } from './entities/channel.entity';
import { FavouriteConversation } from './entities/favourite-conversation.entity';
import { FavouritePost } from './entities/favourite-posts.entity';
import { FavouriteReaction } from './entities/favourite-reaction.entity';
import { UserChannel } from './entities/user-channel.entity';
import { UserReportedPost } from './entities/user-reported-posts.entity';
import { UserReportedReactionConversation } from './entities/user-reported-reactions-conversations.entity';
import { UserReportedReaction } from './entities/user-reported-reactions.entity';
import { SearchPostsArgs, SearchPostsResponse } from './dto/search-posts.dto';
import { UpdateUserPollPostOptionArgs } from './dto/update-user-poll-post-options.dto';
import { UserPollPostOption } from './entities/user-poll-post.entity';
import { GetAdminPostDetailResponse } from './dto/get-admin-post-details.dto';
import { GetReactionsConversationResponse } from './dto/get-reaction-conversations.dto';
import { GetChannelPostAndItsReactionResponse } from './dto/get-post-reactions.dto';
import { TranslationService } from '@shared/services/translation/translation.service';
import { getISODate } from '../utils/util';
import {
  GetPrivateChannelsArgs,
  GetPrivateChannelsResponse,
} from './dto/get-private-channels.dto';
import {
  GetDoctorPrivateChannelsArgs,
  GetDoctorPrivateChannelsResponse,
} from './dto/get-doctor-private-channels.dto';
import { GetOrganisationChannelsResponse } from './dto/get-organisation-channels.dto';
import {
  GetDoctorChannelUsersListArgs,
  GetDoctorChannelUsersListResponse,
} from './dto/get-doctor-channel-users-list.dto';

import {
  ChannelDoctorPostArgs,
  GetDoctorChannelPostAndItsReactionResponse,
} from './dto/get-doctor-channel-post-and-reaction.dto';

import {
  SearchDoctorPostsArgs,
  SearchDoctorPostsResponse,
} from './dto/search-doctor-post.dto';
import {
  GetDoctorChannelPostsArgs,
  GetDoctorChannelPostsResponse,
} from './dto/get-doctor-channel-posts.dto';
import {
  GetDoctorFeedArgs,
  GetDoctorFeedResponse,
} from './dto/get-doctor-feed.dto';
import { DisableChannelUserPostResponse } from './dto/disable-channel-user-post.dto';
@Injectable()
export class ChannelsService {
  private readonly logger = new Logger(ChannelsService.name);
  constructor(
    private readonly channelsRepo: ChannelsRepo,
    private readonly rewardsRepo: RewardsRepo,
    private readonly eventEmitter: EventEmitter2,
    private readonly channelsQueue: ChannelsQueue,
    private readonly translationService: TranslationService,
  ) {}

  async followChannel(followChannelBody: FollowChannelBody): Promise<void> {
    await this.channelsQueue.updateChannelsFollowersCount(
      followChannelBody.channel_id,
    );
    await this.channelsQueue.userChannelUpdated(followChannelBody);
  }

  async updateChannelFollowers(channelId: string): Promise<string> {
    const followers = await this.channelsRepo.getChannelFollowers(channelId);
    const channel = await this.channelsRepo.updateChannelFollowersCount(
      channelId,
      followers,
    );
    const message = `${channel.title} ${this.translationService.translate(
      'channels.total_followers',
    )} ${channel.total_followers}`;
    this.logger.log(message);
    return message;
  }

  async userChannelUpdated(body: FollowChannelBody): Promise<Response> {
    const { id: userChannelId } = body;
    const userChannel = await this.channelsRepo.getUserChannelById(
      userChannelId,
    );
    if (!userChannel) {
      throw new NotFoundException(`channels.user_channel_not_found`);
    }
    if (userChannel.is_channel_unfollowed) {
      return {
        response: this.translationService.translate(
          `channels.channel_unfollowed`,
        ),
      };
    }

    this.eventEmitter.emit(
      ChannelsEvent.CHANNEL_FOLLOWED,
      new ChannelFollowedEvent(userChannel),
    );
    return {
      response: this.translationService.translate(`channels.channel_followed`),
    };
  }

  async channelPostHandler(
    channelPostBodyDto: ChannelPostBodyDto,
  ): Promise<Response> {
    const {
      data: { id: postId },
      operation,
    } = channelPostBodyDto;
    const userChannelPost = await this.channelsRepo.getChannelUserPostById(
      postId,
    );

    if (!userChannelPost) {
      return {
        response: this.translationService.translate(
          `channels.user_channel_post_not_found`,
        ),
      };
    }

    if (operation === HasuraEventTriggerOperation.UPDATE) {
      this.eventEmitter.emit(
        ChannelsEvent.CHANNEL_POST_UPDATED,
        new ChannelPostUpdatedEvent(userChannelPost),
      );
      return {
        response: this.translationService.translate(
          `channels.channel_post_updated`,
        ),
      };
    }

    this.eventEmitter.emit(
      ChannelsEvent.CHANNEL_POST_ADDED,
      new ChannelPostAddedEvent(userChannelPost),
    );
    return {
      response: this.translationService.translate(
        `channels.channel_post_added`,
      ),
    };
  }

  /**
   * @description  It is used for  CHANNEL_POST_REACTION event used in channel processor.
   */
  // async postReactionHandler(
  //   postReactionBody: PostReactionBody,
  // ): Promise<Response> {
  //   const user = await this.channelsRepo.getUserById(postReactionBody.user_id);
  //   if (!user) {
  //     throw new NotFoundException(`channels.user_not_found`);
  //   }
  //   const userPostReaction = await this.channelsRepo.getPostReactionById(
  //     postReactionBody.id,
  //   );
  //   if (!userPostReaction) {
  //     throw new BadRequestException(`channels.invalid_post_reaction`);
  //   }

  //   const reactionReward = await this.rewardsRepo.getPostReactionReward(
  //     userPostReaction,
  //   );
  //   this.logger.log(reactionReward);
  //   if (!reactionReward) {
  //     this.eventEmitter.emit(
  //       ChannelsEvent.CHANNEL_POST_REACTION_ADDED,
  //       new PostReactionAddedEvent(userPostReaction),
  //     );
  //     return {
  //       response: this.translationService.translate(
  //         `channels.post_reaction_reward_added`,
  //       ),
  //     };
  //   }
  //   return {
  //     response: `${this.translationService.translate(
  //       'channels.post_reaction_reward_already_added',
  //     )} ${userPostReaction.id}`,
  //   };
  // }

  async channelPost(channelPostBody: ChannelPostBodyDto): Promise<void> {
    this.eventEmitter.emit(
      ChannelsEvent.CHANNEL_POST,
      new ChannelPostEvent(channelPostBody),
    );
  }

  /**
   * @description Triggered from user_channel_post_reaction Hasura Event Trigger
   * It's migrated in channelPostReaction Resolver we need to emit CHANNEL_POST_REACTION_ADDED event but app team is not using this migration
   * Found duplication Event in Community module (channel_post_reactions Event which is to update total_reactions only)
   * It is used for @function postReaction() function in channel controller.
   */
  // async postReaction(postReactionBody: PostReactionBody): Promise<void> {
  //   this.eventEmitter.emit(
  //     ChannelsEvent.CHANNEL_POST_REACTION,
  //     new PostReactionEvent(postReactionBody),
  //   );
  // }

  private sortChannels(channels: Channel[]): Channel[] {
    return channels.sort((a, b) =>
      a.title > b.title ? 1 : b.title > a.title ? -1 : 0,
    );
  }

  async getChannels(
    userId: string,
    search?: string,
    lang?: string,
  ): Promise<GetChannelsResponse> {
    const user = await this.channelsRepo.getUserById(userId);
    if (!user) {
      throw new NotFoundException(`channels.user_not_found`);
    }
    const { organization_id } = user;
    const { channels, userChannels, trending } =
      await this.channelsRepo.getChannelsAndUserChannels(
        userId,
        organization_id,
        user.role,
        search,
        lang,
      );
    const userChannelIds = userChannels.map((channel) => channel.id);
    const [finalChannels, finalTrending] = [channels, trending].map((group) =>
      group.filter((channel) => !userChannelIds.includes(channel.id)),
    );
    return {
      channels: this.sortChannels(finalChannels),
      trending: this.sortChannels(finalTrending),
      userChannels: this.sortChannels(userChannels),
    };
  }
  async postImagesAndVideoUpdate(
    userId: string,
    postId: string,
    payload: UpdatePostPayload,
  ): Promise<PostUpdateResponse> {
    const data = {
      userId,
      postId,
      payload,
    };
    const userPost = await this.channelsRepo.checkUserPost(userId, postId);
    if (!userPost) {
      throw new NotFoundException(`channels.postId_not_exist`);
    }
    const res = await this.updateImageAndVideoOfPost(data);
    if (!res) {
      throw new BadRequestException(`channels.invalid_payload`);
    } else {
      const { ids, operation, isMsgUpdated } = res;
      const imgsAndVid = await this.channelsRepo.getPostImagesAndVideos(
        userId,
        postId,
      );
      this.logger.log(`No of images: ${imgsAndVid.images.length}`);
      this.logger.log(`No of videos: ${imgsAndVid.videos.length}`);
      const response: PostUpdateResponse = {
        operation: operation,
        ids: ids,
        isMsgUpdated,
        ...imgsAndVid,
      };
      return response;
    }
  }
  private async updateImageAndVideoOfPost(
    data: SavePostImagesAndVideo,
  ): Promise<
    | { operation: OperationTypes; ids: string[]; isMsgUpdated: boolean }
    | undefined
  > {
    const { userId, postId, payload } = data;
    const { message, images, image_ids, videos, video_ids } = payload;
    let isMsgUpdated = false;
    if (message) {
      const updatePostMessage = await this.channelsRepo.updatePostMessage(
        userId,
        postId,
        message,
      );
      isMsgUpdated = updatePostMessage ? true : false;
    }
    if (!image_ids && !images && !videos && !video_ids) {
      const deletedImages = await this.channelsRepo.deleteAllImages(
        userId,
        postId,
      );
      const deletedVideos = await this.channelsRepo.deleteVideo(userId, postId);
      return {
        operation: OperationTypes.DELETE,
        ids: [...deletedImages, ...deletedVideos],
        isMsgUpdated,
      };
    }
    if (image_ids && !images && !videos && !video_ids) {
      const deletedImage: string[] = await this.channelsRepo.deleteOneImage(
        image_ids ? image_ids[0] : '',
      );
      return {
        operation: OperationTypes.DELETE_IMAGE,
        ids: deletedImage,
        isMsgUpdated,
      };
    }
    // if user likes to insert one or many images
    if (images && !image_ids && !video_ids && !videos) {
      const uploadedImages = await this.channelsRepo.insertOneOrMultipleImage(
        userId,
        postId,
        images as PayloadImage[],
      );
      return {
        operation: OperationTypes.INSERT_IMAGE,
        ids: uploadedImages,
        isMsgUpdated,
      };
    }
    if (videos && !video_ids && !image_ids && !images) {
      const uploadedVideo = await this.channelsRepo.insertVideo(
        userId,
        postId,
        videos as PayloadVideo[],
      );
      return {
        operation: OperationTypes.INSERT_VIDEO,
        ids: uploadedVideo,
        isMsgUpdated,
      };
    }
    if (videos && !video_ids && !image_ids && images) {
      const uploadedImagesAndVideo =
        await this.channelsRepo.insertOneOrMultipleImagesAndVideo(
          userId,
          postId,
          videos as PayloadVideo[],
          images as PayloadImage[],
        );
      return {
        operation: OperationTypes.INSERT_BOTH,
        ids: uploadedImagesAndVideo,
        isMsgUpdated,
      };
    }
  }
  async postLike(postLikeBody: PostLikeBody): Promise<void> {
    this.eventEmitter.emit(
      ChannelsEvent.CHANNEL_POST_LIKED,
      new ChannelPostLikeUpdatedEvent(postLikeBody),
    );
  }

  async updateChannelsFollowersCount(): Promise<Channel[]> {
    const followersCount = await this.channelsRepo.getChannelsFollowersCount();
    this.logger.log(followersCount);
    if (!followersCount.length) {
      throw new NotFoundException(`channels.no_channel_follower`);
    }
    const channels = await this.channelsRepo.updateChannelsFollowersCount(
      followersCount,
    );
    return channels;
  }

  async getChannelUsers(args: UserChannelArgs): Promise<Users[]> {
    const channels = await this.channelsRepo.getChannelUsers(args.channelId);
    return channels;
  }

  async saveChannelPostReaction(
    userId: string,
    input: ChannelPostReactionInput,
  ): Promise<ChannelPostReactions> {
    const inputData: PostReactionDto = { user_id: userId, ...input };
    const postReaction = await this.channelsRepo.saveChannelPostReaction(
      inputData,
    );
    if (!postReaction) {
      throw new NotFoundException(`channels.failed_to_save_post_reaction`);
    }

    this.eventEmitter.emit(
      ChannelsEvent.CHANNEL_POST_REACTION_ADDED,
      new PostReactionAddedEvent(postReaction),
    );
    return postReaction;
  }

  async disableUserPost(
    userId: string,
    postId: string,
  ): Promise<DisableChannelUserPostResponse> {
    const channelUserPost = await this.channelsRepo.getChannelUserPost(
      userId,
      postId,
    );
    if (!channelUserPost) {
      throw new NotFoundException(`channels.post_not_found`);
    }
    const { id: post_id } = channelUserPost;
    const disableChannelUserPost = await this.channelsRepo.disableUserPost(
      post_id,
    );
    return { channel_user_post: disableChannelUserPost };
  }

  async userfollowChannel(
    userId: string,
    channelId: string,
  ): Promise<UserChannel> {
    const channelExist = await this.channelsRepo.getUserChannel(
      userId,
      channelId,
    );
    if (channelExist) {
      throw new BadRequestException(`channels.user_already_followed_channel`);
    }
    const channels = await this.channelsRepo.userfollowChannel(
      channelId,
      userId,
    );
    return channels;
  }

  async updateFavoritePost(
    userId: string,
    args: UpdateFavouritePostDto,
  ): Promise<FavouritePost> {
    const { postId, postCreatorId, favourite } = args;
    const [user, post, postCreator] = await Promise.all([
      this.channelsRepo.getUserById(userId),
      this.channelsRepo.getPostById(postId),
      this.channelsRepo.getUserById(postCreatorId),
    ]);
    if (!user) {
      throw new NotFoundException(`channels.user_not_found`);
    }
    if (!post) {
      throw new NotFoundException(`channels.post_not_found`);
    }
    if (!postCreator) {
      throw new NotFoundException(`channels.post_creator_not_found`);
    }
    const favouritePostExist = await this.channelsRepo.getFavouritePost(
      userId,
      postId,
    );
    if (!favouritePostExist && favourite) {
      const favoritePostNew = await this.channelsRepo.addFavouritePost(
        userId,
        postId,
        postCreatorId,
      );
      return favoritePostNew;
    }

    if (favouritePostExist && favourite) {
      throw new BadRequestException(`channels.already_favourite_post`);
    }
    if (!favouritePostExist && !favourite) {
      throw new BadRequestException(`channels.already_unfavourite_post`);
    }
    const removeFavouritePost = await this.channelsRepo.removeFavouritePost(
      userId,
      postId,
    );
    return removeFavouritePost;
  }

  async updateChannelPostLike(
    userId: string,
    args: ChannelPostLikesArgs,
  ): Promise<ChannelPostLikes> {
    const { channelId, postId, like } = args;
    const [user, post, channel] = await Promise.all([
      this.channelsRepo.getUserById(userId),
      this.channelsRepo.getPostById(postId),
      this.channelsRepo.getChannelById(channelId),
    ]);
    if (!user) {
      throw new NotFoundException(`channels.user_not_found`);
    }
    if (!post) {
      throw new NotFoundException(`channels.post_not_found`);
    }
    if (!channel) {
      throw new NotFoundException(`channels.channel_not_found`);
    }
    const postLikeExist = await this.channelsRepo.getChannelPostLike(
      userId,
      postId,
      channelId,
    );
    if (postLikeExist && like) {
      throw new BadRequestException(`channels.already_liked_post`);
    }
    if (!postLikeExist && !like) {
      throw new BadRequestException(`channels.already_unliked_post`);
    }
    if (!postLikeExist && like) {
      const likePostNew = await this.channelsRepo.addChannelPostLike(
        userId,
        postId,
        channelId,
      );
      this.eventEmitter.emit(
        ChannelsEvent.CHANNEL_POST_LIKED,
        new ChannelPostLikeUpdatedEvent(likePostNew),
      );
      return likePostNew;
    }
    const removePostLike = await this.channelsRepo.removePostLike(
      userId,
      postId,
      channelId,
    );
    this.eventEmitter.emit(
      ChannelsEvent.CHANNEL_POST_UNLIKED,
      new ChannelPostLikeUpdatedEvent(removePostLike),
    );
    return removePostLike;
  }

  async userUnfollowChannel(
    userId: string,
    channelId: string,
  ): Promise<UserChannel> {
    const channels = await this.channelsRepo.userUnfollowChannel(
      channelId,
      userId,
    );
    return channels;
  }

  async updateChannelFollowStatus(
    args: UserFollowChannelStatusArgs,
  ): Promise<UserChannel> {
    const channels = await this.channelsRepo.updateChannelFollowStatusById(
      args.id,
      args.is_channel_unfollowed,
    );
    return channels;
  }

  async savePost(
    userId: string,
    input: SaveUserPostInput,
  ): Promise<ChannelUserPost> {
    const inputData: UserPostData = { user_id: userId, ...input };
    const channels = await this.channelsRepo.savePost(inputData);
    return channels;
  }

  async getAdminPostDetails(
    userId: string,
    postId: string,
  ): Promise<GetAdminPostDetailResponse> {
    const [postDetails, reactionDetails] = await Promise.all([
      this.channelsRepo.getUserPostDetails(userId, postId),
      this.channelsRepo.getPostReactionDetails(userId, postId),
    ]);
    if (!postDetails) {
      throw new NotFoundException(`channels.user_post_not_found`);
    }
    return {
      posts: postDetails,
      reactions: reactionDetails,
    };
  }

  async updatePost(
    postId: string,
    post: UserPostInput,
  ): Promise<ChannelUserPost> {
    const userPost = await this.channelsRepo.getUserPostById(postId);
    if (!userPost) {
      throw new NotFoundException(`channels.user_post_not_found`);
    }
    const channels = await this.channelsRepo.updatePostById(postId, post);
    return channels;
  }

  async updatePostWithImages(
    userId: string,
    args: UpdatePostWithImageInput,
  ): Promise<PostWithImagesResponse> {
    const { post, images, postId } = args;
    const mappedImage: PostImageDto[] = images.map((image) => {
      return {
        ...image,
        user_id: userId,
      };
    });
    const [userPost, postImage] = await Promise.all([
      this.channelsRepo.updatePostById(postId, post),
      this.channelsRepo.savePostImages(mappedImage),
    ]);
    return {
      userPost: userPost,
      postImages: postImage,
    };
  }

  async disableUserPostReaction(
    args: PostReactionArgs,
  ): Promise<ChannelPostReactions> {
    const { reactionId } = args;
    const postReaction = await this.channelsRepo.getPostReactionById(
      reactionId,
    );
    if (!postReaction) {
      throw new NotFoundException(`channels.user_reaction_not_found`);
    }
    const disablePostReaction = await this.channelsRepo.disableUserPostReaction(
      reactionId,
    );
    if (!disablePostReaction) {
      throw new BadRequestException(`channels.failed_disable_reaction`);
    }
    this.eventEmitter.emit(
      ChannelsEvent.CHANNEL_POST_REACTION_DISABLED,
      new PostReactionUpdatedEvent(disablePostReaction),
    );
    return disablePostReaction;
  }

  async disableUserPostReactionComment(
    args: PostReactionConversationArgs,
  ): Promise<ChannelPostConversation> {
    const { conversationId } = args;
    const reactionConversation = await this.channelsRepo.getConversationById(
      conversationId,
    );
    if (!reactionConversation) {
      throw new NotFoundException(
        `channels.post_reaction_converstaion_not_found`,
      );
    }
    const disableReactionConversation =
      await this.channelsRepo.disableUserPostReactionComment(conversationId);
    if (!disableReactionConversation) {
      throw new NotFoundException(
        `channels.failed_disable_reaction_conversation`,
      );
    }

    this.eventEmitter.emit(
      ChannelsEvent.CHANNEL_POST_REACTION_REPLY_DISABLED,
      new ReactionConversationUpdatedEvent(disableReactionConversation),
    );
    return disableReactionConversation;
  }

  async updatefavoriteReaction(
    userId: string,
    input: FavouriteReactionInput,
  ): Promise<FavouriteReaction> {
    const { post_id, reaction_id, reaction_creator_id, favourite } = input;
    const [user, post, reactionCreator, postReaction] = await Promise.all([
      this.channelsRepo.getUserById(userId),
      this.channelsRepo.getPostById(post_id),
      this.channelsRepo.getUserById(reaction_creator_id),
      this.channelsRepo.getPostReactionById(reaction_id),
    ]);
    if (!user) {
      throw new NotFoundException(`channels.user_not_found`);
    }
    if (!post) {
      throw new NotFoundException(`channels_post_not_found`);
    }
    if (!reactionCreator) {
      throw new NotFoundException(`channels.post_reaction_creator_not_found`);
    }
    if (!postReaction) {
      throw new NotFoundException(`channels.post_reaction_not_found`);
    }
    const favouriteReactionExist = await this.channelsRepo.getFavouriteReaction(
      userId,
      reaction_id,
      post_id,
    );
    const inputData: FavouriteReactionDto = {
      user_id: userId,
      post_id,
      reaction_id,
      reaction_creator_id,
    };
    if (!favouriteReactionExist && favourite) {
      const favoriteReactionNew = await this.channelsRepo.addFavoriteReaction(
        inputData,
      );
      return favoriteReactionNew;
    }

    if (favouriteReactionExist && favourite) {
      throw new BadRequestException(`channels.already_favourite_post_reaction`);
    }
    if (!favouriteReactionExist && !favourite) {
      throw new BadRequestException(
        `channels.already_unfavourite_post_reaction`,
      );
    }
    const removeFavouriteReaction =
      await this.channelsRepo.removeFavouriteReaction(
        userId,
        post_id,
        reaction_id,
      );
    return removeFavouriteReaction;
  }

  async updateChannelPostReactionLike(
    userId: string,
    input: ChannelPostReactionLikeInput,
  ): Promise<ChannelPostReactionLike> {
    const { channelId, postId, reactionId, like } = input;
    const [user, post, postReaction, channel] = await Promise.all([
      this.channelsRepo.getUserById(userId),
      this.channelsRepo.getPostById(postId),
      this.channelsRepo.getPostReactionById(reactionId),
      this.channelsRepo.getChannelById(channelId),
    ]);
    if (!user) {
      throw new NotFoundException(`channels.user_not_found`);
    }
    if (!post) {
      throw new NotFoundException(`channels.post_not_found`);
    }
    if (!postReaction) {
      throw new NotFoundException(`channels.post_reaction_not_found`);
    }
    if (!channel) {
      throw new NotFoundException(`channels.channel_not_found`);
    }
    const postReactionLikeExist =
      await this.channelsRepo.getChannelPostReactionLike(
        userId,
        postId,
        channelId,
        reactionId,
      );
    if (postReactionLikeExist && like) {
      throw new BadRequestException(`channels.already_liked_post_reaction`);
    }
    if (!postReactionLikeExist && !like) {
      throw new BadRequestException(`channels.already_unliked_post_reaction`);
    }

    if (!postReactionLikeExist && like) {
      const likePosReactiontNew =
        await this.channelsRepo.addLikeChannelPostReaction(
          userId,
          postId,
          channelId,
          reactionId,
        );
      this.eventEmitter.emit(
        ChannelsEvent.CHANNEL_POST_REACTION_LIKED,
        new ChannelPostReactionLikeUpdatedEvent(likePosReactiontNew),
      );
      return likePosReactiontNew;
    }
    const removePostReactionLike =
      await this.channelsRepo.removePostReactionLike(
        userId,
        postId,
        channelId,
        reactionId,
      );
    this.eventEmitter.emit(
      ChannelsEvent.CHANNEL_POST_REACTION_UNLIKED,
      new ChannelPostReactionLikeUpdatedEvent(removePostReactionLike),
    );
    return removePostReactionLike;
  }

  async updatePostReactionConversationLike(
    userId: string,
    input: ChannelPostReactionConversationLikeInput,
  ): Promise<ChannelPostReactionConversationLikes> {
    const { channel_id, post_id, reaction_id, conversation_id, like } = input;

    const [user, post, postReaction, channel, reactionConversation] =
      await Promise.all([
        this.channelsRepo.getUserById(userId),
        this.channelsRepo.getPostById(post_id),
        this.channelsRepo.getPostReactionById(reaction_id),
        this.channelsRepo.getChannelById(channel_id),
        this.channelsRepo.getConversationById(conversation_id),
      ]);
    if (!user) {
      throw new NotFoundException(`channels.user_not_found`);
    }
    if (!post) {
      throw new NotFoundException(`channels.post_not_found`);
    }
    if (!postReaction) {
      throw new NotFoundException(`channels.post_reaction_not_found`);
    }
    if (!channel) {
      throw new NotFoundException(`channels.channel_not_found`);
    }
    if (!reactionConversation) {
      throw new NotFoundException(
        `channels.post_reaction_converstaion_not_found`,
      );
    }
    const conversationLikeExist =
      await this.channelsRepo.getReactionConversationLike(
        userId,
        reaction_id,
        conversation_id,
      );

    if (conversationLikeExist && like) {
      throw new BadRequestException(`channels.already_liked_conversation`);
    }
    if (!conversationLikeExist && !like) {
      throw new BadRequestException(`channels.already_unliked_conversation`);
    }

    const inputData: ChannelPostReactionConversationLikeDto = {
      user_id: userId,
      post_id,
      reaction_id,
      channel_id,
      conversation_id,
    };

    if (!conversationLikeExist && like) {
      const conversationLikeNew =
        await this.channelsRepo.addReactionConversationLike(inputData);

      this.eventEmitter.emit(
        ChannelsEvent.CHANNEL_POST_REACTION_CONVERSATION_LIKED,
        new ChannelConversationLikeUpdatedEvent(conversationLikeNew),
      );
      return conversationLikeNew;
    }

    const removeConversationLike =
      await this.channelsRepo.removeConversationLike(
        userId,
        reaction_id,
        conversation_id,
      );
    this.eventEmitter.emit(
      ChannelsEvent.CHANNEL_POST_REACTION_CONVERSATION_UNLIKED,
      new ChannelConversationLikeUpdatedEvent(removeConversationLike),
    );
    return removeConversationLike;
  }

  async updateReaction(
    postReactionId: string,
    message: string,
  ): Promise<ChannelPostReactions> {
    const postReaction = await this.channelsRepo.getPostReactionById(
      postReactionId,
    );
    if (!postReaction) {
      throw new NotFoundException(`channels.post_reaction_not_found`);
    }
    const updateReaction = await this.channelsRepo.updateReactionById(
      postReactionId,
      message,
    );

    if (!updateReaction) {
      throw new BadRequestException(`channels.failed_update_reaction`);
    }
    return updateReaction;
  }

  async favouriteReactionConversation(
    userId: string,
    input: FavouriteConversationInput,
  ): Promise<FavouriteConversation> {
    const {
      post_id,
      conversation_id,
      reaction_id,
      conversation_creator_id,
      favourite,
    } = input;
    const [
      user,
      post,
      conversationCreator,
      postReaction,
      reactionConversation,
    ] = await Promise.all([
      this.channelsRepo.getUserById(userId),
      this.channelsRepo.getPostById(post_id),
      this.channelsRepo.getUserById(conversation_creator_id),
      this.channelsRepo.getPostReactionById(reaction_id),
      this.channelsRepo.getConversationById(conversation_id),
    ]);
    if (!user) {
      throw new NotFoundException(`channels.user_not_found`);
    }
    if (!post) {
      throw new NotFoundException(`channels.post_not_found`);
    }
    if (!conversationCreator) {
      throw new NotFoundException(`channels.conversation_creator_not_found`);
    }
    if (!postReaction) {
      throw new NotFoundException(`channels.post_reaction_not_found`);
    }
    if (!reactionConversation) {
      throw new NotFoundException(
        `channels.post_reaction_converstaion_not_found`,
      );
    }

    const favouriteConversationExist =
      await this.channelsRepo.getFavouriteReactionConversation(
        userId,
        reaction_id,
        conversation_id,
      );
    const inputData: FavouriteConversationDto = {
      user_id: userId,
      post_id,
      reaction_id,
      conversation_id,
      conversation_creator_id,
    };
    if (!favouriteConversationExist && favourite) {
      const favoriteReactionNew =
        await this.channelsRepo.addFavouriteReactionConversation(inputData);
      return favoriteReactionNew;
    }

    if (favouriteConversationExist && favourite) {
      throw new BadRequestException(
        `channels.already_favourite_reaction_conversation`,
      );
    }
    if (!favouriteConversationExist && !favourite) {
      throw new BadRequestException(
        `channels.already_unfavourite_reaction_conversation`,
      );
    }
    const removeFavouriteConversation =
      await this.channelsRepo.removeFavouriteConversation(
        userId,
        reaction_id,
        conversation_id,
      );
    return removeFavouriteConversation;
  }

  async updateReactionConversation(
    conversationId: string,
    message: string,
  ): Promise<ChannelPostConversation> {
    const reactionConversation = await this.channelsRepo.getConversationById(
      conversationId,
    );
    if (!reactionConversation) {
      throw new NotFoundException(
        `channels.post_reaction_converstaion_not_found`,
      );
    }
    const updateReactionConversation =
      await this.channelsRepo.updateReactionConversationById(
        conversationId,
        message,
      );

    if (!updateReactionConversation) {
      throw new NotFoundException(
        `channels.failed_update_reaction_conversation`,
      );
    }
    return updateReactionConversation;
  }

  async saveChannelPostReactionConversation(
    userId: string,
    input: ChannelPostReactionConversationInput,
  ): Promise<ChannelPostConversation> {
    const inputData: ChannelPostReactionConversationDto = {
      user_id: userId,
      ...input,
    };
    const channelPostReactionConversation =
      await this.channelsRepo.saveChannelPostReactionConversation(inputData);

    if (!channelPostReactionConversation) {
      throw new NotFoundException(
        `channels.failed_to_save_post_reaction_conversation`,
      );
    }

    this.eventEmitter.emit(
      ChannelsEvent.CHANNEL_POST_REACTION_REPLY_ADDED,
      new ReactionConversationUpdatedEvent(channelPostReactionConversation),
    );
    return channelPostReactionConversation;
  }

  async saveUserReportReactionConversation(
    userId: string,
    input: UserReportedReactionConversationInput,
  ): Promise<UserReportedReactionConversation> {
    const inputData: ReportedReactionConversation = {
      user_id: userId,
      ...input,
    };
    const userReactionConversation =
      await this.channelsRepo.saveUserReportReactionConversation(inputData);
    return userReactionConversation;
  }

  async saveUserReportedPost(
    userId: string,
    input: UserReportedPostInput,
  ): Promise<UserReportedPost> {
    const inputData: ReportedPost = { user_id: userId, ...input };
    const userPost = await this.channelsRepo.saveUserReportedPost(inputData);
    return userPost;
  }

  async saveUserReportedReaction(
    userId: string,
    input: UserReportedReactionInput,
  ): Promise<UserReportedReaction> {
    const inputData: ReportedReaction = { user_id: userId, ...input };
    const reportReaction = await this.channelsRepo.saveUserReportedReaction(
      inputData,
    );
    return reportReaction;
  }

  async updateUserChannelFeed(
    body: UpdateChannelUserFeed,
  ): Promise<UpdateChannelUserFeedResponse> {
    const { userId, channelId } = body;
    const [user, channel] = await Promise.all([
      this.channelsRepo.getUserById(userId),
      this.channelsRepo.getChannelById(channelId),
    ]);
    if (!user || !channel) {
      throw new NotFoundException(`channels.user_channel_not_found`);
    }
    const lastChannelPost =
      await this.channelsRepo.getLastChannelPostFromUserChannelFeed(
        userId,
        channelId,
      );
    //  let startDate: string | undefined;
    if (!lastChannelPost) {
      return {
        message: this.translationService.translate(
          `channels.last_channel_post_not_found`,
        ),
      };
    }
    // startDate = DateTime.fromJSDate(
    //   new Date(lastChannelPost.created_at),
    // ).toISODate();
    this.logger.log(
      `Last channel post in feed ${lastChannelPost.id} ${lastChannelPost.created_at}`,
    );
    // unhide the previously hidden post on channel unfollow
    const userChannelFeeds =
      await this.channelsRepo.updateUserChannelFeedPostsStatus(
        userId,
        channelId,
        false,
      );

    // const posts = await this.channelsRepo.getChannelUserPostsByDate(
    //   channelId,
    //   startDate,
    // );
    // let postsCount = 0;
    // if (!posts.length) {
    //   this.logger.warn(`No new posts to add in feed`);
    // }
    // if (posts.length) {
    //   const feed = posts.map((post) => ({
    //     user_id: userId,
    //     post_id: post.id,
    //     channel_id: post.channel_id,
    //   }));
    //   await this.channelsRepo.addToUserChannelFeed(feed);
    //   postsCount = posts.length;
    // }
    return {
      message: `[ ${
        userChannelFeeds.length
      } ] ${this.translationService.translate(
        'channels.user_channel_feed_updated',
      )}`,
    };
  }

  async getMyGroups(userId: string): Promise<GetMyGroupsResponse> {
    const channels = await this.channelsRepo.getUserChannels(userId);
    return {
      channels,
    };
  }

  emitChannelUpdateEvent(
    isChannelUnfollowed: boolean,
    userChannel: UserChannel,
  ): void {
    if (isChannelUnfollowed) {
      this.logger.log(`Channel unfollowed`);
      this.eventEmitter.emit(
        ChannelsEvent.CHANNEL_UNFOLLOWED,
        new ChannelUnfollowedEvent(userChannel),
      );
      return;
    }
    this.eventEmitter.emit(
      ChannelsEvent.CHANNEL_FOLLOWED,
      new ChannelFollowedEvent(userChannel),
    );
    this.logger.log(`Channel being followed`);
  }

  async updateUserChannel(
    userId: string,
    args: UpdateUserChannelArgsDto,
    organisationId?: string,
  ): Promise<UserChannel> {
    if (!organisationId) {
      throw new NotFoundException(`channels.organisation_not_found`);
    }
    const { channelId, follow } = args;
    const [user, channel] = await Promise.all([
      this.channelsRepo.getUserById(userId),
      this.channelsRepo.getChannelById(channelId),
    ]);
    const isChannelUnfollowed = !follow;
    if (!user) {
      throw new NotFoundException(`channels.user_not_found`);
    }
    if (!channel) {
      throw new NotFoundException(`channels.channel_not_found`);
    }
    const existingUserChannel = await this.channelsRepo.getUserChannel(
      userId,
      channelId,
    );

    if (!existingUserChannel) {
      const newUserChannel = await this.channelsRepo.addUserChannel({
        user_id: userId,
        channel_id: channelId,
        is_channel_unfollowed: isChannelUnfollowed,
        organisation_id: organisationId,
      });
      this.emitChannelUpdateEvent(isChannelUnfollowed, newUserChannel);
      return newUserChannel;
    }

    if (existingUserChannel.is_channel_unfollowed === isChannelUnfollowed) {
      const action = isChannelUnfollowed ? 'unfollowed' : 'followed';
      throw new BadRequestException(
        action === 'unfollowed'
          ? `${this.translationService.translate(
              'channels.already_unFollowed',
            )}`
          : `${this.translationService.translate('channels.already_followed')}`,
      );
    }
    const updatedUserChannel = await this.channelsRepo.updateUserChannel(
      userId,
      channelId,
      isChannelUnfollowed,
    );
    this.emitChannelUpdateEvent(isChannelUnfollowed, updatedUserChannel);
    return updatedUserChannel;
  }

  async saveLastPostCreatedDateInUserChannel(
    userId: string,
    channelId: string,
  ): Promise<string> {
    const channelUserPost = await this.channelsRepo.getChannelLastPost(
      userId,
      channelId,
    );
    if (!channelUserPost) {
      const message = this.translationService.translate(
        `channels.channel_no_post`,
      );
      this.logger.log(message);
      return message;
    }
    if (channelUserPost.is_exists) {
      const message = this.translationService.translate(
        `channels.user_feed_post_exist`,
      );
      this.logger.log(message);
      return message;
    }
    await this.channelsRepo.updateUserChannelLastPostDate(
      userId,
      channelId,
      channelUserPost.created_at,
    );
    return `${channelId}${this.translationService.translate(
      'channels.last_post_date',
    )} ${channelUserPost.created_at}`;
  }

  async getMyChannels(
    userId: string,
    organizationId?: string,
  ): Promise<GetMyChannelResponse> {
    if (!organizationId) {
      throw new NotFoundException(`toolkits.organization_not_found`);
    }
    const channels = await this.channelsRepo.getUserChannelsWithLatestPost(
      userId,
      organizationId,
    );
    return {
      channels,
    };
  }

  private async getUserTimelineFeedData(
    userId: string,
    organizationId: string,
    args: GetUserFeedArgs,
  ): Promise<GetUserFeedResponse> {
    const dateString = getISODate(new Date());
    const [userFeedData, publicPostsData] = await Promise.all([
      this.channelsRepo.getUserFeed(
        userId,
        organizationId,
        dateString,
        args.page,
        args.limit,
      ),
      this.channelsRepo.getDefaultChannelPosts(
        userId,
        organizationId,
        dateString,
        args.page,
        args.limit,
      ),
    ]);
    const posts = this.mapUserChannelPosts([
      ...userFeedData.posts,
      ...publicPostsData.posts,
    ]).sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    const hasMoreUserFeed = args.page * args.limit < userFeedData.total;
    const hasMorePublicPosts = args.page * args.limit < publicPostsData.total;
    return {
      posts,
      hasMore: hasMorePublicPosts || hasMoreUserFeed,
    };
  }

  async getUserFeed(
    userId: string,
    args: GetUserFeedArgs,
    organizationId?: string,
  ): Promise<GetUserFeedResponse> {
    if (!organizationId) {
      throw new NotFoundException(`toolkits.organization_not_found`);
    }
    return this.getUserTimelineFeedData(userId, organizationId, args);
  }

  async getUserChannelsTimeline(
    userId: string,
    organizationId?: string,
  ): Promise<GetUserChannelsTimelineResponse> {
    const [{ channels }, { posts, hasMore }] = await Promise.all([
      this.getMyChannels(userId, organizationId),
      this.getUserFeed(userId, { limit: 16, page: 1 }, organizationId),
    ]);
    const defaultChannel = await this.channelsRepo.getDefaultChannel();
    return {
      channels,
      posts,
      hasMore,
      default_channel: defaultChannel,
    };
  }

  async addChannelPostToUserChannelFeed(
    body: AddChannelUserFeed,
  ): Promise<AddChannelUserFeedResponse> {
    const { channelId, postId } = body;
    const followerUserIds = await this.channelsRepo.getChannelFollowersUserIds(
      channelId,
      postId,
    );
    if (!followerUserIds.length) {
      this.logger.warn(`channel user feed already added`);
      return {
        message: ` ${this.translationService.translate(
          'channels.user_channel_feed_already_added',
        )} ${channelId} `,
      };
    }
    const userChannelFeeds = followerUserIds.map((userId) => ({
      user_id: userId,
      post_id: postId,
      channel_id: channelId,
    }));
    await this.channelsRepo.addToUserChannelFeed(userChannelFeeds);
    return {
      message: `${this.translationService.translate(
        'channels.user_channel_feed_added',
      )} ${userChannelFeeds.length} ${this.translationService.translate(
        'channels.users',
      )}`,
    };
  }

  async getChannelDetails(
    id: string,
    userId: string,
    filters?: ChannelPostFilter,
  ): Promise<GetChannelDetailsResponse> {
    const dateString = getISODate(new Date());
    const channelsWithTools = await this.channelsRepo.getChannelWithTools(
      id,
      userId,
    );
    if (!channelsWithTools) {
      throw new NotFoundException(`channels.channel_not_found`);
    }
    this.eventEmitter.emit(
      ChannelsEvent.CHANNEL_POST_VIEWED,
      new ChannelPostViewedEvent(userId, id),
    );
    const { posts } = await this.channelsRepo.getChannelPosts({
      id,
      userId,
      date: dateString,
      page: 1,
      limit: 16,
      filters,
    });
    const filteredPosts = this.mapUserChannelPosts(posts);
    const {
      channel_tools: tools,
      user_channels,
      ...channel
    } = channelsWithTools;

    const mappedChannel: ChannelDetailDto = {
      ...channel,
      is_channel_followed: channel.default_channel,
    };

    if (user_channels.length) {
      const [userChannel] = user_channels;
      mappedChannel.userChannel = userChannel;
      if (!userChannel.is_channel_unfollowed) {
        mappedChannel.is_channel_followed = true;
      }
    }
    return {
      channel: mappedChannel,
      tools,
      posts: filteredPosts,
    };
  }

  private getPollPostDuration(endDate: Date): {
    duration: number;
    durationUnit: string;
  } {
    const endDateTime = DateTime.fromJSDate(new Date(endDate)).toUTC();
    const { seconds } = endDateTime.diffNow('seconds').toObject();
    const { minutes } = endDateTime.diffNow('minutes').toObject();
    const { days } = endDateTime.diffNow('days').toObject();
    const { hours } = endDateTime.diffNow('hours').toObject();
    const isSeconds = seconds && seconds >= 1;
    let duration = isSeconds ? seconds : 0;
    let durationUnit = 'second';
    const isDays = days && days >= 1;
    if (days && days >= 1) {
      duration = days;
      durationUnit = 'day';
    }
    const isHours = hours && hours >= 1;
    if (isHours && !isDays) {
      duration = hours;
      durationUnit = 'hour';
    }
    const isMinutes = minutes && minutes >= 1;
    if (isMinutes && !isHours && !isDays) {
      duration = minutes;
      durationUnit = 'minute';
    }
    durationUnit = duration > 1 ? `${durationUnit}s` : durationUnit;
    return { duration: Math.floor(duration), durationUnit };
  }

  mapUserChannelPosts(posts: UserFeedPost[]): UserFeedPost[] {
    return posts.map((post) => {
      const [user] = post.users;
      const [selectedOptions] = post.selected_poll_options;
      const durationData = post.end_date
        ? this.getPollPostDuration(post.end_date)
        : {};
      return {
        ...post,
        user,
        selected_poll_option: selectedOptions,
        votes: post.user_poll_post_options.length,
        ...durationData,
      };
    });
  }

  async getChannelPosts(
    args: GetChannelPostsArgs,
    userId: string,
  ): Promise<GetChannelPostsResponse> {
    const dateString = getISODate(new Date());
    const { id } = args;
    const { posts, total } = await this.channelsRepo.getChannelPosts({
      id,
      userId,
      date: dateString,
      page: args.page,
      limit: args.limit,
    });
    const mappedPosts = this.mapUserChannelPosts(posts);
    const hasMore = args.page * args.limit < total;
    return {
      has_more: hasMore,
      posts: mappedPosts,
    };
  }

  async viewChannelPostInUserChannelFeed(
    userId: string,
    channelId: string,
  ): Promise<string> {
    const userChannelFeed =
      await this.channelsRepo.getLatestPostUserChannelFeed(userId, channelId);
    if (!userChannelFeed) {
      return this.translationService.translate(
        `channels.user_channel_feed_not_found`,
      );
    }
    if (userChannelFeed.viewed) {
      return this.translationService.translate(
        `channels.already_viewed_channel_post`,
      );
    }
    const updatedUserChannelFeed =
      await this.channelsRepo.updateUserChannelFeedAsViewed(userId, channelId);
    if (!updatedUserChannelFeed.length) {
      return this.translationService.translate(
        `channels.failed_user_channel_feed`,
      );
    }
    return `${this.translationService.translate('channels.viewed')} ${
      updatedUserChannelFeed.length
    } ${this.translationService.translate('channels.channel_posts')}`;
  }

  async getReactionConversations(
    userId: string,
    args: PostReactionArgs,
  ): Promise<GetReactionsConversationResponse> {
    const { reactionId, limit, page } = args;
    const { reactionConversations, total } =
      await this.channelsRepo.getReactionConversations(
        userId,
        reactionId,
        page,
        limit,
      );

    if (!reactionConversations) {
      throw new NotFoundException(
        `channels.post_reaction_converstaion_not_found`,
      );
    }
    const hasMore = page * limit < total;
    return {
      reactionConversations: reactionConversations,
      has_more: hasMore,
    };
  }
  async hideUserChannelFeed(
    userId: string,
    channelId: string,
  ): Promise<string> {
    const updatedUserChannelFeed = await this.channelsRepo.hideUserChannelFeeds(
      userId,
      channelId,
    );
    if (!updatedUserChannelFeed) {
      return this.translationService.translate(
        `channels.failed_hide_user_channel_feeds`,
      );
    }
    return `${this.translationService.translate(
      'channels.successfully_hide_user_channel_feeds',
    )} ${updatedUserChannelFeed.channel_id}`;
  }

  async getPostAndItsReactions(
    userId: string,
    args: ChannelUserPostArgs,
  ): Promise<GetChannelPostAndItsReactionResponse> {
    const { postId, page, limit } = args;
    const [userPost, { postReactions, total }] = await Promise.all([
      this.channelsRepo.getUserPost(userId, postId),
      this.channelsRepo.getPostReaction(userId, postId, page, limit),
    ]);
    if (!userPost) {
      throw new NotFoundException(`channels.user_post_not_found`);
    }
    const hasMore = page * limit < total;
    return {
      posts: userPost,
      reactions: postReactions,
      has_more: hasMore,
    };
  }
  async handleChannelPostUpdated(userPost: ChannelUserPost): Promise<void> {
    const {
      is_post_disabled_by_admin: isPostDisabledByAdmin,
      user_id: userId,
    } = userPost;

    if (isPostDisabledByAdmin) {
      this.eventEmitter.emit(
        ChannelsEvent.CHANNEL_POST_DISABLED_BY_ADMIN,
        new ChannelPostDisabledByAdminEvent(userId),
      );
    }
  }

  async searchPosts(
    userId: string,
    args: SearchPostsArgs,
  ): Promise<SearchPostsResponse> {
    const dateString = getISODate(new Date());
    const { text, page, limit } = args;
    const { posts, total } = await this.channelsRepo.searchPosts(
      userId,
      dateString,
      text,
      page,
      limit,
    );
    const mappedPosts = this.mapUserChannelPosts(posts);
    const hasMore = args.page * args.limit < total;
    return {
      has_more: hasMore,
      posts: mappedPosts,
    };
  }

  async getFavouritePosts(
    args: GetUserFeedArgs,
    userId: string,
  ): Promise<GetFavouritePostsResponse> {
    const { posts, total } = await this.channelsRepo.getFavouritePosts(
      userId,
      args.page,
      args.limit,
    );
    const mappedPosts = this.mapUserChannelPosts(posts);
    const hasMore = args.page * args.limit < total;
    return {
      has_more: hasMore,
      posts: mappedPosts,
    };
  }

  async updateUserPollPostOption(
    userId: string,
    args: UpdateUserPollPostOptionArgs,
  ): Promise<UserPollPostOption> {
    const userPollPostOption: Omit<
      UserPollPostOption,
      'created_at' | 'updated_at' | 'id'
    > = {
      user_id: userId,
      poll_option_id: args.pollOptionId,
      poll_post_id: args.postId,
      is_selected: args.is_selected,
    };

    const savedUserPollPostId = await this.channelsRepo.saveUserPollPostOption(
      userPollPostOption,
    );
    return savedUserPollPostId;
  }

  async updateLikesCount(id: string, likeType: string): Promise<string> {
    const likeTableName = likeTable.get(likeType);
    const likeUpdateTableName = likeUpdateTable.get(likeType);
    const fieldName = tableFieldName.get(likeType);
    if (!likeTableName || !likeUpdateTableName || !fieldName) {
      return `${likeType} ${this.translationService.translate(
        'channels.table_not_found',
      )}`;
    }
    const likes = await this.channelsRepo.getLikes(id, likeUpdateTableName);
    if (!likes) {
      return `${likeType} ${this.translationService.translate(
        'channels.not_found',
      )}`;
    }
    const count = await this.channelsRepo.getLikesCount(
      id,
      likeTableName,
      fieldName,
    );
    await this.channelsRepo.updateLikesCount(id, likeUpdateTableName, count);
    return `${this.translationService.translate(
      'channels.successfully_updated',
    )} ${likeType} ${this.translationService.translate(
      'channels.of',
    )} ${id} ${this.translationService.translate('count_to')} ${count}`;
  }

  /**
   * Update reactions count for a given entity ID, which can be either a channel_user_posts ID or channel_user_posts ID.
   *
   * @param body - An object containing the entity ID (id) and the type of comment (commentType).
   * @returns A promise that resolves to a string indicating the success or failure of the update.
   */
  async updateReactionsCount(body: UpdateReactionCountDto): Promise<string> {
    const { reactionType } = body;

    const userPostOrPostReaction =
      await this.channelsRepo.getUserPostOrPostReaction(body);

    if (!userPostOrPostReaction) {
      return `${this.translationService.translate(
        'channels.data_for_reaction_type',
      )} ${reactionType} ${this.translationService.translate(
        'channels.not_found',
      )}`;
    }
    const { id: genericId } = userPostOrPostReaction;

    const count = await this.channelsRepo.getReactionsCount(body);

    const updatedUserPostOrPostReaction =
      await this.channelsRepo.updateReactionCount(
        genericId,
        reactionType,
        count,
      );

    if (!updatedUserPostOrPostReaction) {
      throw new BadRequestException(`channels.failed_update_count`);
    }

    return `${this.translationService.translate(
      'channels.successfully_updated',
    )} ${reactionType} ${this.translationService.translate(
      'channels.total_count',
    )} ${updatedUserPostOrPostReaction.total_reactions}`;
  }

  async getPrivateChannels(
    userId: string,
    args: GetPrivateChannelsArgs,
  ): Promise<GetPrivateChannelsResponse> {
    const { page, limit, search } = args;
    const { channels, total } = await this.channelsRepo.getPrivateChannels(
      userId,
      page,
      limit,
      search,
    );
    const hasMore = args.page * args.limit < total;
    return { channels, hasMore: hasMore };
  }
  async getDoctorPrivateChannels(
    userId: string,
    args: GetDoctorPrivateChannelsArgs,
  ): Promise<GetDoctorPrivateChannelsResponse> {
    const { page, limit, search } = args;
    const { channels, total } = await this.channelsRepo.getPrivateChannels(
      userId,
      page,
      limit,
      search,
    );
    const totalPages = Math.ceil(total / limit);
    return { channels, total, totalPages, page, limit };
  }
  async getChannelById(channelId: string): Promise<Channel> {
    return await this.channelsRepo.getChannelById(channelId);
  }

  async getOrganisationChannels(
    lang: string,
    search?: string,
    organizationId?: string,
  ): Promise<GetOrganisationChannelsResponse> {
    if (!organizationId) {
      throw new NotFoundException(`groups.organisation_not_found`);
    }
    const channels = await this.channelsRepo.getOrganisationChannels(
      organizationId,
      search,
    );

    const [translatedGroups] = channels.map(() => {
      return this.translationService.getTranslations<Channel>(
        channels,
        ['title', 'short_description'],
        lang,
      );
    });

    return { channels: translatedGroups };
  }

  async getChannelUserList(
    userId: string,
    args: ChannelUserListArgs,
  ): Promise<GetChannelUserListResponse> {
    const { channelId, page, limit } = args;
    const isUserInChannel = await this.channelsRepo.getUserInChannel(
      userId,
      channelId,
    );
    if (!isUserInChannel) {
      throw new NotFoundException(`channels.user_not_found_in_the_channel`);
    }
    const { users, total } = await this.channelsRepo.getChannelUserList(
      channelId,
      page,
      limit,
    );
    const hasMore = args.page * args.limit < total;
    return { users, hasMore: hasMore };
  }

  async getDoctorChannelUserList(
    args: GetDoctorChannelUsersListArgs,
  ): Promise<GetDoctorChannelUsersListResponse> {
    const { channelId, page, limit, userId } = args;
    const user = await this.channelsRepo.getUserById(userId);
    if (!user) {
      throw new NotFoundException(`channels.user_not_found`);
    }
    const { users, total } = await this.channelsRepo.getChannelUserList(
      channelId,
      page,
      limit,
    );
    const totalPages = Math.ceil(total / limit);
    return { users, total, totalPages, page, limit };
  }

  async getDoctorPostAndItsReactions(
    userId: string,
    args: ChannelDoctorPostArgs,
  ): Promise<GetDoctorChannelPostAndItsReactionResponse> {
    const { postId, page, limit } = args;
    const [doctorPost, { postReactions, total }] = await Promise.all([
      this.channelsRepo.getUserPost(userId, postId),
      this.channelsRepo.getPostReaction(userId, postId, page, limit),
    ]);
    if (!doctorPost) {
      throw new NotFoundException(`channels.doctor_post_not_found`);
    }
    const totalPages = Math.ceil(total / limit);
    return {
      posts: doctorPost,
      reactions: postReactions,
      total,
      totalPages,
      page,
      limit,
    };
  }

  async searchDoctorPosts(
    userId: string,
    args: SearchDoctorPostsArgs,
  ): Promise<SearchDoctorPostsResponse> {
    const dateString = getISODate(new Date());
    const { text, page, limit } = args;
    const { posts, total } = await this.channelsRepo.searchPosts(
      userId,
      dateString,
      text,
      page,
      limit,
    );
    const mappedPosts = this.mapUserChannelPosts(posts);
    const totalPages = Math.ceil(total / limit);
    return { posts: mappedPosts, total, totalPages, page, limit };
  }

  async getDoctorChannelPosts(
    args: GetDoctorChannelPostsArgs,
    userId: string,
  ): Promise<GetDoctorChannelPostsResponse> {
    const dateString = getISODate(new Date());
    const { id, page, limit } = args;
    const { posts, total } = await this.channelsRepo.getChannelPosts({
      id,
      userId,
      date: dateString,
      page,
      limit,
    });
    const mappedPosts = this.mapUserChannelPosts(posts);
    const totalPages = Math.ceil(total / limit);
    return {
      posts: mappedPosts,
      total,
      totalPages,
      page,
      limit,
    };
  }

  private async getDoctorTimelineFeedData(
    userId: string,
    organizationId: string,
    args: GetDoctorFeedArgs,
  ): Promise<GetDoctorFeedResponse> {
    const { page, limit } = args;
    const dateString = getISODate(new Date());
    const [doctorFeedData, publicPostsData] = await Promise.all([
      this.channelsRepo.getUserFeed(
        userId,
        organizationId,
        dateString,
        page,
        limit,
      ),
      this.channelsRepo.getDefaultChannelPosts(
        userId,
        organizationId,
        dateString,
        page,
        limit,
      ),
    ]);
    const posts = this.mapUserChannelPosts([
      ...doctorFeedData.posts,
      ...publicPostsData.posts,
    ]).sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    const totalPagesUserFeed = Math.ceil(doctorFeedData.total / limit);
    const totalPagesPublicPosts = Math.ceil(publicPostsData.total / limit);
    return {
      posts,
      totalPages: totalPagesPublicPosts || totalPagesUserFeed,
      total: publicPostsData.total || doctorFeedData.total,
      page,
      limit,
    };
  }

  async getDoctorFeed(
    userId: string,
    args: GetDoctorFeedArgs,
    organizationId?: string,
  ): Promise<GetDoctorFeedResponse> {
    if (!organizationId) {
      throw new NotFoundException(`toolkits.organization_not_found`);
    }
    return this.getDoctorTimelineFeedData(userId, organizationId, args);
  }
}
