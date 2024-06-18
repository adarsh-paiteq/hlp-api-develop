import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  GetChannelsArgs,
  GetChannelsResponse,
  PostUpdateResponse,
  UpdatePostImagesAndVideo,
} from './channels.model';
import { ChannelsService } from './channels.service';
import { GetUser } from '../shared/decorators/user.decorator';
import { LoggedInUser } from '../shared/auth/jwt.strategy';
import { Roles } from '../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../shared/guards/auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { UserRoles } from '../users/users.dto';
import { UseGuards } from '@nestjs/common';
import {
  ChannelUserListArgs,
  GetChannelUserListResponse,
  UserChannelArgs,
  UserFollowChannelArgs,
  UserFollowChannelStatusArgs,
} from './dto/user-channels.dto';
import { Users } from '../users/users.model';
import {
  ChannelPostReactionInput,
  PostReactionArgs,
  UpdateReactionArgs,
} from './dto/channel-user-reaction.dto';
import { ChannelPostReactions } from './entities/channel-post-reactions.entity';
import { ChannelUserPost } from './entities/channel-user-posts.entity';
import {
  ChannelUserPostArgs,
  PostWithImagesResponse,
  SaveUserPostInput,
  UpdatePostWithImageInput,
  UpdateUserPostInput,
} from './dto/channel-user-post.dto';
import { UserChannel } from './entities/user-channel.entity';
import {
  GetFavouritePostsResponse,
  UpdateFavouritePostDto,
} from './dto/favourite-posts.dto';
import { FavouritePost } from './entities/favourite-posts.entity';
import { ChannelPostLikesArgs } from './dto/channel-post-likes.dto';
import { ChannelPostLikes } from './entities/channel-post-likes.entity';
import { ChannelPostConversation } from './entities/channel-post-conversation.entity';
import {
  ChannelPostReactionConversationInput,
  PostReactionConversationArgs,
  UpdateReactionConversationArgs,
} from './dto/channel-post-reaction-conversation.dto';
import { FavouriteReactionInput } from './dto/favourite-reaction.dto';
import { FavouriteReaction } from './entities/favourite-reaction.entity';
import { ChannelPostReactionLikeInput } from './dto/channel-post-reaction-likes.dto';
import { ChannelPostReactionLike } from './entities/channel-post-reaction-like.entity';
import { ChannelPostReactionConversationLikeInput } from './dto/channel-post-reaction-conversation-likes.dto';
import { ChannelPostReactionConversationLikes } from './entities/channel-post-reaction-conversation-likes.entity';
import { FavouriteConversation } from './entities/favourite-conversation.entity';
import { FavouriteConversationInput } from './dto/favourite-converasation.dto';
import {
  UserReportedPostInput,
  UserReportedReactionConversationInput,
  UserReportedReactionInput,
} from './dto/channel.dto';
import { UserReportedReaction } from './entities/user-reported-reactions.entity';
import { UserReportedPost } from './entities/user-reported-posts.entity';
import { UserReportedReactionConversation } from './entities/user-reported-reactions-conversations.entity';
import { GetMyGroupsResponse } from './dto/get-my-groups.dto';
import { UpdateUserChannelArgsDto } from './dto/update-user-channel.dto';
import { GetMyChannelResponse } from './dto/get-my-channels.dto';
import { GetUserFeedArgs, GetUserFeedResponse } from './dto/get-user-feed.dto';
import { GetUserChannelsTimelineResponse } from './dto/get-user-channels-timeline.dto';
import {
  GetChannelDetailsArgs,
  GetChannelDetailsResponse,
} from './dto/get-channel-details.dto';
import {
  GetChannelPostsArgs,
  GetChannelPostsResponse,
} from './dto/get-channel-posts.dto';
import { SearchPostsArgs, SearchPostsResponse } from './dto/search-posts.dto';
import { UpdateUserPollPostOptionArgs } from './dto/update-user-poll-post-options.dto';
import { UserPollPostOption } from './entities/user-poll-post.entity';
import {
  AdminPostDetailArgs,
  GetAdminPostDetailResponse,
} from './dto/get-admin-post-details.dto';
import { GetReactionsConversationResponse } from './dto/get-reaction-conversations.dto';
import { GetChannelPostAndItsReactionResponse } from './dto/get-post-reactions.dto';
import {
  GetPrivateChannelsArgs,
  GetPrivateChannelsResponse,
} from './dto/get-private-channels.dto';
import {
  GetDoctorPrivateChannelsArgs,
  GetDoctorPrivateChannelsResponse,
} from './dto/get-doctor-private-channels.dto';
import {
  GetOrganisationChannelsArgs,
  GetOrganisationChannelsResponse,
} from './dto/get-organisation-channels.dto';
import { I18nNextLanguage } from '@shared/decorators/language.decorator';
import {
  GetDoctorChannelUsersListArgs,
  GetDoctorChannelUsersListResponse,
} from './dto/get-doctor-channel-users-list.dto';
import {
  SearchDoctorPostsArgs,
  SearchDoctorPostsResponse,
} from './dto/search-doctor-post.dto';
import {
  ChannelDoctorPostArgs,
  GetDoctorChannelPostAndItsReactionResponse,
} from './dto/get-doctor-channel-post-and-reaction.dto';

import {
  GetDoctorChannelPostsArgs,
  GetDoctorChannelPostsResponse,
} from './dto/get-doctor-channel-posts.dto';
import {
  GetDoctorFeedArgs,
  GetDoctorFeedResponse,
} from './dto/get-doctor-feed.dto';
import {
  DisableChannelUserPostArgs,
  DisableChannelUserPostResponse,
} from './dto/disable-channel-user-post.dto';
import { GetUserChannelsArgs } from './dto/get-user-channel.dto';
@Resolver()
export class ChannelsResolver {
  constructor(private readonly channelsService: ChannelsService) {}

  @Query(() => GetChannelsResponse, {
    deprecationReason: 'migrated to new query getUserChannels',
  })
  async getChannels(
    @Args() args: GetChannelsArgs,
  ): Promise<GetChannelsResponse> {
    return this.channelsService.getChannels(args.user_id);
  }

  @Roles(UserRoles.USER, UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetChannelsResponse, { name: 'getUserChannels' })
  async getUserChannels(
    @GetUser() user: LoggedInUser,
    @Args() args: GetUserChannelsArgs,
    @I18nNextLanguage() lang: string,
  ): Promise<GetChannelsResponse> {
    return this.channelsService.getChannels(user.id, args.search, lang);
  }

  @Roles(UserRoles.USER, UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => PostUpdateResponse)
  async updatePostImagesAndVideo(
    @GetUser() user: LoggedInUser,
    @Args('input') input: UpdatePostImagesAndVideo,
  ): Promise<PostUpdateResponse> {
    const { postId, payload } = input;
    return await this.channelsService.postImagesAndVideoUpdate(
      user.id,
      postId,
      payload,
    );
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => [Users], {
    nullable: 'items',
    name: 'getChannelUsers',
  })
  async getChannelUsers(@Args() args: UserChannelArgs): Promise<Users[]> {
    return this.channelsService.getChannelUsers(args);
  }

  @Roles(UserRoles.USER, UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => ChannelPostReactions, {
    name: 'saveChannelPostReaction',
  })
  async saveChannelPostReaction(
    @GetUser() user: LoggedInUser,
    @Args('input') input: ChannelPostReactionInput,
  ): Promise<ChannelPostReactions> {
    return this.channelsService.saveChannelPostReaction(user.id, input);
  }

  @Roles(UserRoles.USER, UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => DisableChannelUserPostResponse, {
    name: 'disableUserPost',
  })
  async disableUserPost(
    @GetUser() user: LoggedInUser,
    @Args() args: DisableChannelUserPostArgs,
  ): Promise<DisableChannelUserPostResponse> {
    return this.channelsService.disableUserPost(user.id, args.postId);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => UserChannel, {
    name: 'followChannel',
  })
  async followChannel(
    @GetUser() user: LoggedInUser,
    @Args() args: UserFollowChannelArgs,
  ): Promise<UserChannel> {
    return this.channelsService.userfollowChannel(user.id, args.channelId);
  }

  @Roles(UserRoles.USER, UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => FavouritePost, {
    name: 'updateFavoritePost',
  })
  async updateFavoritePost(
    @GetUser() user: LoggedInUser,
    @Args() args: UpdateFavouritePostDto,
  ): Promise<FavouritePost> {
    return this.channelsService.updateFavoritePost(user.id, args);
  }

  /**
   * @description to like and unLike post
   */
  @Roles(UserRoles.USER, UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => ChannelPostLikes, {
    name: 'updateChannelPostLike',
    description: 'To like and unLike post',
  })
  async updateChannelPostLike(
    @GetUser() user: LoggedInUser,
    @Args() args: ChannelPostLikesArgs,
  ): Promise<ChannelPostLikes> {
    return this.channelsService.updateChannelPostLike(user.id, args);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => UserChannel, {
    name: 'unFollowChannel',
  })
  async unFollowChannel(
    @GetUser() user: LoggedInUser,
    @Args() args: UserFollowChannelArgs,
  ): Promise<UserChannel> {
    return this.channelsService.userUnfollowChannel(user.id, args.channelId);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => UserChannel, {
    name: 'updateChannelFollowStatus',
  })
  async updateChannelFollowStatus(
    @Args() args: UserFollowChannelStatusArgs,
  ): Promise<UserChannel> {
    return this.channelsService.updateChannelFollowStatus(args);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => ChannelUserPost, {
    name: 'savePost',
  })
  async savePost(
    @GetUser() user: LoggedInUser,
    @Args('input') input: SaveUserPostInput,
  ): Promise<ChannelUserPost> {
    return this.channelsService.savePost(user.id, input);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetAdminPostDetailResponse, {
    name: 'getAdminPostDetails',
  })
  async getAdminPostDetails(
    @GetUser() user: LoggedInUser,
    @Args() args: AdminPostDetailArgs,
  ): Promise<GetAdminPostDetailResponse> {
    return this.channelsService.getAdminPostDetails(user.id, args.postId);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => ChannelUserPost, {
    name: 'updatePost',
  })
  async updatePost(
    @Args('input') input: UpdateUserPostInput,
  ): Promise<ChannelUserPost> {
    return this.channelsService.updatePost(input.postId, input.post);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => PostWithImagesResponse, {
    name: 'updatePostWithImages',
  })
  async updatePostWithImages(
    @GetUser() user: LoggedInUser,
    @Args('input') input: UpdatePostWithImageInput,
  ): Promise<PostWithImagesResponse> {
    return this.channelsService.updatePostWithImages(user.id, input);
  }

  @Roles(UserRoles.USER, UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => ChannelPostReactions, {
    name: 'disableUserPostReaction',
  })
  async disableUserPostReaction(
    @Args() args: PostReactionArgs,
  ): Promise<ChannelPostReactions> {
    return this.channelsService.disableUserPostReaction(args);
  }

  @Roles(UserRoles.USER, UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => ChannelPostConversation, {
    name: 'disableUserPostReactionComment',
  })
  async disableUserPostReactionComment(
    @Args() args: PostReactionConversationArgs,
  ): Promise<ChannelPostConversation> {
    return this.channelsService.disableUserPostReactionComment(args);
  }

  /**
   * @description to favourite and unFavourite Post Reaction
   */
  @Roles(UserRoles.USER, UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => FavouriteReaction, {
    name: 'updatefavoriteReaction',
    description: 'To favourite and unFavourite Post Reaction',
  })
  async updatefavoriteReaction(
    @GetUser() user: LoggedInUser,
    @Args('input') input: FavouriteReactionInput,
  ): Promise<FavouriteReaction> {
    return this.channelsService.updatefavoriteReaction(user.id, input);
  }

  /**
   * @description to like and unLike post reaction
   */
  @Roles(UserRoles.USER, UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => ChannelPostReactionLike, {
    name: 'updateChannelPostReactionLike',
    description: 'to like and unLike post reaction',
  })
  async updateChannelPostReactionLike(
    @GetUser() user: LoggedInUser,
    @Args('input') input: ChannelPostReactionLikeInput,
  ): Promise<ChannelPostReactionLike> {
    return this.channelsService.updateChannelPostReactionLike(user.id, input);
  }

  /**
   * @description to like and unLike reaction conversation
   */
  @Roles(UserRoles.USER, UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => ChannelPostReactionConversationLikes, {
    name: 'updatePostReactionConversationLike',
    description: 'To like and unLike reaction conversation',
  })
  async updatelikePostReactionConversation(
    @GetUser() user: LoggedInUser,
    @Args('input') input: ChannelPostReactionConversationLikeInput,
  ): Promise<ChannelPostReactionConversationLikes> {
    return this.channelsService.updatePostReactionConversationLike(
      user.id,
      input,
    );
  }

  @Roles(UserRoles.USER, UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => ChannelPostReactions, {
    name: 'updateReaction',
  })
  async updateReaction(
    @Args() args: UpdateReactionArgs,
  ): Promise<ChannelPostReactions> {
    return this.channelsService.updateReaction(args.reactionId, args.message);
  }

  /**
   * @description to favourite and unFavourite Reaction Conversation
   */
  @Roles(UserRoles.USER, UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => FavouriteConversation, {
    name: 'updateFavouriteConversation',
    description: 'to favourite and unFavourite Reaction Conversation',
  })
  async favouriteReactionConversation(
    @GetUser() user: LoggedInUser,
    @Args('input') input: FavouriteConversationInput,
  ): Promise<FavouriteConversation> {
    return this.channelsService.favouriteReactionConversation(user.id, input);
  }

  @Roles(UserRoles.USER, UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => ChannelPostConversation, {
    name: 'updateReactionConversation',
  })
  async updateReactionConversation(
    @Args() args: UpdateReactionConversationArgs,
  ): Promise<ChannelPostConversation> {
    return this.channelsService.updateReactionConversation(
      args.conversationId,
      args.message,
    );
  }

  @Roles(UserRoles.USER, UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => UserReportedReactionConversation, {
    name: 'saveUserReportReactionConversation',
  })
  async userReportReactionConversation(
    @GetUser() user: LoggedInUser,
    @Args('input')
    input: UserReportedReactionConversationInput,
  ): Promise<UserReportedReactionConversation> {
    return this.channelsService.saveUserReportReactionConversation(
      user.id,
      input,
    );
  }

  @Roles(UserRoles.USER, UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => UserReportedPost, {
    name: 'saveUserReportedPost',
  })
  async userReportedPost(
    @GetUser() user: LoggedInUser,
    @Args('input') input: UserReportedPostInput,
  ): Promise<UserReportedPost> {
    return this.channelsService.saveUserReportedPost(user.id, input);
  }

  @Roles(UserRoles.USER, UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => UserReportedReaction, {
    name: 'saveUserReportedReaction',
  })
  async userReportedReaction(
    @GetUser() user: LoggedInUser,
    @Args('input') input: UserReportedReactionInput,
  ): Promise<UserReportedReaction> {
    return this.channelsService.saveUserReportedReaction(user.id, input);
  }

  @Roles(UserRoles.USER, UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => ChannelPostConversation, {
    name: 'saveChannelPostReactionConversation',
  })
  async saveChannelPostReactionConversation(
    @GetUser() user: LoggedInUser,
    @Args('input') input: ChannelPostReactionConversationInput,
  ): Promise<ChannelPostConversation> {
    return this.channelsService.saveChannelPostReactionConversation(
      user.id,
      input,
    );
  }

  @Query(() => GetMyGroupsResponse, {
    name: 'getMyGroups',
    description: 'sends user following groups with updates',
  })
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getMyGroups(
    @GetUser() user: LoggedInUser,
  ): Promise<GetMyGroupsResponse> {
    return this.channelsService.getMyGroups(user.id);
  }

  /**
   * @description to follow and un follow group or channel
   */
  @Mutation(() => UserChannel, {
    name: 'updateUserChannel',
    description: 'To follow and unfollow channel or group',
  })
  @Roles(UserRoles.USER, UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateUserChannel(
    @GetUser() user: LoggedInUser,
    @Args() args: UpdateUserChannelArgsDto,
  ): Promise<UserChannel> {
    return this.channelsService.updateUserChannel(
      user.id,
      args,
      user.organization_id,
    );
  }

  @Query(() => GetMyChannelResponse, {
    name: 'getMyChannels',
  })
  @Roles(UserRoles.USER, UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getMyChannels(
    @GetUser() user: LoggedInUser,
  ): Promise<GetMyChannelResponse> {
    return this.channelsService.getMyChannels(user.id, user.organization_id);
  }

  @Query(() => GetUserFeedResponse, {
    name: 'GetUserFeed',
    description: 'user timeline posts',
  })
  @Roles(UserRoles.USER, UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getUserFeed(
    @GetUser() user: LoggedInUser,
    @Args() args: GetUserFeedArgs,
  ): Promise<GetUserFeedResponse> {
    return this.channelsService.getUserFeed(
      user.id,
      args,
      user.organization_id,
    );
  }

  @Query(() => GetUserChannelsTimelineResponse, {
    name: 'GetUserChannelsTimeline',
    description: 'channels and timeline posts',
  })
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getUserChannelsTimeline(
    @GetUser() user: LoggedInUser,
  ): Promise<GetUserChannelsTimelineResponse> {
    return this.channelsService.getUserChannelsTimeline(
      user.id,
      user.organization_id,
    );
  }

  @Query(() => GetChannelDetailsResponse, {
    name: 'getChannelDetails',
    description: 'channel details',
  })
  @Roles(UserRoles.USER, UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getChannelDetails(
    @GetUser() user: LoggedInUser,
    @Args() args: GetChannelDetailsArgs,
  ): Promise<GetChannelDetailsResponse> {
    return this.channelsService.getChannelDetails(
      args.id,
      user.id,
      args.filters,
    );
  }

  @Query(() => GetChannelPostsResponse, {
    name: 'getChannelPosts',
    description: 'posts of particular channel',
  })
  @Roles(UserRoles.USER, UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getChannelPosts(
    @Args() args: GetChannelPostsArgs,
    @GetUser() user: LoggedInUser,
  ): Promise<GetChannelPostsResponse> {
    return this.channelsService.getChannelPosts(args, user.id);
  }

  @Query(() => GetChannelPostAndItsReactionResponse, {
    name: 'getPostAndItsReactions',
  })
  @Roles(UserRoles.USER, UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getPostAndItsReactions(
    @Args() args: ChannelUserPostArgs,
    @GetUser() user: LoggedInUser,
  ): Promise<GetChannelPostAndItsReactionResponse> {
    return this.channelsService.getPostAndItsReactions(user.id, args);
  }

  @Query(() => GetReactionsConversationResponse, {
    name: 'getReactionConversations',
  })
  @Roles(UserRoles.USER, UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getReactionConversations(
    @GetUser() user: LoggedInUser,
    @Args() args: PostReactionArgs,
  ): Promise<GetReactionsConversationResponse> {
    return this.channelsService.getReactionConversations(user.id, args);
  }

  @Query(() => SearchPostsResponse, {
    name: 'searchPosts',
    description: 'search posts in user followed channels',
  })
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async searchPosts(
    @GetUser() user: LoggedInUser,
    @Args() args: SearchPostsArgs,
  ): Promise<SearchPostsResponse> {
    return this.channelsService.searchPosts(user.id, args);
  }

  @Query(() => GetFavouritePostsResponse, {
    name: 'getFavouritePosts',
    description: 'get user favourite posts',
  })
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getFavouritePosts(
    @Args() args: GetUserFeedArgs,
    @GetUser() user: LoggedInUser,
  ): Promise<GetFavouritePostsResponse> {
    return this.channelsService.getFavouritePosts(args, user.id);
  }

  @Mutation(() => UserPollPostOption, {
    name: 'updateUserPollPostOption',
  })
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateUserPollPostOption(
    @GetUser() user: LoggedInUser,
    @Args() args: UpdateUserPollPostOptionArgs,
  ): Promise<UserPollPostOption> {
    return this.channelsService.updateUserPollPostOption(user.id, args);
  }

  @Query(() => GetPrivateChannelsResponse, {
    name: 'getPrivateChannels',
  })
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getPrivateChannels(
    @GetUser() user: LoggedInUser,
    @Args() args: GetPrivateChannelsArgs,
  ): Promise<GetPrivateChannelsResponse> {
    return await this.channelsService.getPrivateChannels(user.id, args);
  }

  @Query(() => GetDoctorPrivateChannelsResponse, {
    name: 'getDoctorPrivateChannels',
  })
  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getDoctorPrivateChannels(
    @GetUser() user: LoggedInUser,
    @Args() args: GetDoctorPrivateChannelsArgs,
  ): Promise<GetDoctorPrivateChannelsResponse> {
    return await this.channelsService.getDoctorPrivateChannels(user.id, args);
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetOrganisationChannelsResponse, {
    name: 'getOrganisationChannels',
  })
  async getOrganisationChannels(
    @Args() args: GetOrganisationChannelsArgs,
    @GetUser() doctor: LoggedInUser,
    @I18nNextLanguage() lang: string,
  ): Promise<GetOrganisationChannelsResponse> {
    return await this.channelsService.getOrganisationChannels(
      lang,
      args.search,
      doctor.organization_id,
    );
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetChannelUserListResponse, {
    name: 'getChannelUserList',
  })
  async getChannelUserList(
    @GetUser() user: LoggedInUser,
    @Args() args: ChannelUserListArgs,
  ): Promise<GetChannelUserListResponse> {
    return this.channelsService.getChannelUserList(user.id, args);
  }

  /**
   * @description used in Doctor CMS to get the list of users in a particular channel
   */
  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetDoctorChannelUsersListResponse, {
    name: 'getDoctorChannelUserList',
  })
  async getDoctorChannelUserList(
    @Args() args: GetDoctorChannelUsersListArgs,
  ): Promise<GetDoctorChannelUsersListResponse> {
    return this.channelsService.getDoctorChannelUserList(args);
  }

  @Query(() => GetDoctorChannelPostAndItsReactionResponse, {
    name: 'getDoctorPostAndItsReactions',
  })
  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getDoctorPostAndItsReactions(
    @Args() args: ChannelDoctorPostArgs,
    @GetUser() user: LoggedInUser,
  ): Promise<GetDoctorChannelPostAndItsReactionResponse> {
    return this.channelsService.getDoctorPostAndItsReactions(user.id, args);
  }

  @Query(() => SearchDoctorPostsResponse, {
    name: 'searchDoctorPosts',
    description: 'search posts in doctor followed channels',
  })
  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async searchDoctorPosts(
    @GetUser() user: LoggedInUser,
    @Args() args: SearchDoctorPostsArgs,
  ): Promise<SearchDoctorPostsResponse> {
    return this.channelsService.searchDoctorPosts(user.id, args);
  }

  @Query(() => GetDoctorChannelPostsResponse, {
    name: 'getDoctorChannelPosts',
    description: 'posts of particular channel',
  })
  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getDoctorChannelPosts(
    @Args() args: GetDoctorChannelPostsArgs,
    @GetUser() user: LoggedInUser,
  ): Promise<GetDoctorChannelPostsResponse> {
    return this.channelsService.getDoctorChannelPosts(args, user.id);
  }

  @Query(() => GetDoctorFeedResponse, {
    name: 'getDoctorFeed',
    description: 'doctor timeline posts',
  })
  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getDoctorFeed(
    @GetUser() user: LoggedInUser,
    @Args() args: GetDoctorFeedArgs,
  ): Promise<GetDoctorFeedResponse> {
    return this.channelsService.getDoctorFeed(
      user.id,
      args,
      user.organization_id,
    );
  }
}
