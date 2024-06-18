import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { HasuraService } from '../shared/services/hasura/hasura.service';
import { gql } from 'graphql-request';
import {
  ChannelInfo,
  ChannelPostInfo,
  ChannelPostLikeInfo,
  ChannelPostReactionLikeInfo,
  UserChannels,
  UserPost,
} from './community.dto';

/**
 * @deprecated it's used in @function getChannelDetails(),@function getUserChannelDetails() and @function updateChannelFollowers()
 */
const channelFragment = gql`
  fragment channel on channels {
    id
    title
    is_tool_kit_linked
    total_followers
    created_at
    updated_at
  }
`;

const postFragment = gql`
  fragment channel_user_post on channel_user_posts {
    id
    updated_at
    created_at
    user_id
    channel_id
    total_likes
    total_reactions
  }
`;
/**
 * @deprecated it is used in @function getChannelPostReactionInfo() , @function updateChannelPostReactionLikesCount(), @function updateChannelPostReactionCommentCount()and @function updateChannelPostReactionCommentLikesCount()
 */
const reactionFragment = gql`
  fragment channel_post_reaction on channel_post_reactions {
    id
    post_id
    updated_at
    created_at
    user_id
    channel_id
    total_likes
    total_reactions
  }
`;

/**
 * @deprecated it is used in @function getChannelPostReactionCommentInfo() */
const reactionCommentFragment = gql`
  fragment channel_post_reactions_conversation on channel_post_reactions_conversations {
    id
    post_id
    updated_at
    created_at
    user_id
    reaction_id
    channel_id
    total_likes
  }
`;

@Injectable()
export class CommunityRepo {
  private readonly logger = new Logger(CommunityRepo.name);
  constructor(private readonly client: HasuraService) {}

  /**
   * @deprecated it's used in @function updateChannelFollower()
   * which is not been used anywhere
   * updates channel followers
   */
  public async getChannelDetails(channel_id: string) {
    const query = gql`
      query GetChannelInfo($channel_id: uuid!) {
        channels_by_pk(id: $channel_id) {
          ...channel
        }
      }
      ${channelFragment}
    `;
    const channelInfo = await this.client.request<{
      channels_by_pk: ChannelInfo;
    }>(query, { channel_id });
    return channelInfo.channels_by_pk;
  }

  /**
   * @deprecated it's not used anywhere
   */
  public async getUserChannelDetails(channel_id: string, user_id: string) {
    const query = gql`
      query GetChannelInfo($channel_id: uuid!, $user_id: uuid!) {
        user_channels(
          where: {
            _and: [
              { channel_id: { _eq: $channel_id } }
              { user_id: { _eq: $user_id } }
            ]
          }
        ) {
          id
          is_channel_unfollowed
        }
      }
      ${channelFragment}
    `;
    const channelInfo = await this.client.request<{
      user_channels: Array<UserChannels>;
    }>(query, { channel_id, user_id });
    return channelInfo.user_channels;
  }

  /**
   * @deprecated it's used in @function updateChannelFollower()
   * which is not been used anywhere
   * updates channel followers
   */
  public async updateChannelFollowers(
    total_followers: number,
    channel_id: string,
  ) {
    const query = gql`
      mutation UpdateChannelFollowers(
        $channel_id: uuid!
        $total_followers: Int!
      ) {
        update_channels_by_pk(
          pk_columns: { id: $channel_id }
          _set: { total_followers: $total_followers }
        ) {
          ...channel
        }
      }
      ${channelFragment}
    `;
    const channelInfo = await this.client.request<{
      update_channels_by_pk: ChannelInfo;
    }>(query, { channel_id, total_followers });
    return channelInfo.update_channels_by_pk;
  }

  /**
   * @description It's used in @function updateTotaLikesOfChannelPost() and @function updateTotaReactionsOfChannelPost() controller function
   * which is used by channel_post_likes hasura event trigger
   * get's information of a channel post
   */
  public async getChannelPostInfo(post_id: string) {
    const query = gql`
      query GetChannelPostInfo($post_id: uuid!) {
        channel_user_posts_by_pk(id: $post_id) {
          ...channel_user_post
        }
      }
      ${postFragment}
    `;
    const postInfo = await this.client.request<{
      channel_user_posts_by_pk: ChannelPostInfo;
    }>(query, { post_id });
    return postInfo.channel_user_posts_by_pk;
  }

  /**
   * @deprecated It's used in @function updateTotaLikesOfChannelPost() controller function
   * which is used by channel_post_likes hasura event trigger
   * updates channel post likes
   */
  public async updateChannelPostLikes(total_likes: number, post_id: string) {
    const query = gql`
      mutation UpdateChannelPostLikes($post_id: uuid!, $total_likes: Int!) {
        update_channel_user_posts_by_pk(
          pk_columns: { id: $post_id }
          _set: { total_likes: $total_likes }
        ) {
          ...channel_user_post
        }
      }
      ${postFragment}
    `;
    const postInfo = await this.client.request<{
      update_channel_user_posts_by_pk: ChannelPostInfo;
    }>(query, { post_id, total_likes });
    return postInfo.update_channel_user_posts_by_pk;
  }

  /**
   * @deprecated This method is utilized in the 'updateTotalReactionsOfChannelPost' function,
   * which is triggered by the 'channel_post_reactions' Hasura event.
   * It is responsible for updating the total reactions (likes) of a channel post.
   * Please note that this method is deprecated and should not be used in new code.
   */
  public async updateChannelPostReactionsCount(
    total_reactions: number,
    post_id: string,
  ) {
    const query = gql`
      mutation UpdateChannelPostLikes($post_id: uuid!, $total_reactions: Int!) {
        update_channel_user_posts_by_pk(
          pk_columns: { id: $post_id }
          _set: { total_reactions: $total_reactions }
        ) {
          ...channel_user_post
        }
      }
      ${postFragment}
    `;
    const postInfo = await this.client.request<{
      update_channel_user_posts_by_pk: ChannelPostInfo;
    }>(query, { post_id, total_reactions });
    return postInfo.update_channel_user_posts_by_pk;
  }

  /**
   * @deprecated it is used in @function updateTotaLikesOfChannelPostReaction() and @function updateTotaReactionsOfChannelPostReaction()
   * which is used by channel_post_reactions_likes hasura event trigger
   * get's information of a channel post
   */
  public async getChannelPostReactionInfo(reaction_id: string) {
    const query = gql`
      query GetChannelPostReactionInfo($reaction_id: uuid!) {
        channel_post_reactions_by_pk(id: $reaction_id) {
          ...channel_post_reaction
        }
      }
      ${reactionFragment}
    `;
    const reactionInfo = await this.client.request<{
      channel_post_reactions_by_pk: ChannelPostLikeInfo;
    }>(query, { reaction_id });
    return reactionInfo.channel_post_reactions_by_pk;
  }

  /**
   * @deprecated it is used in @function updateTotaLikesOfChannelPostReaction() function
   * which is used by channel_post_reactions_likes hasura event trigger
   * updates channel post reaction likes count
   */
  public async updateChannelPostReactionLikesCount(
    total_likes: number,
    reaction_id: string,
  ) {
    const query = gql`
      mutation UpdateChannelPostReactionLikesCount(
        $reaction_id: uuid!
        $total_likes: Int!
      ) {
        update_channel_post_reactions_by_pk(
          pk_columns: { id: $reaction_id }
          _set: { total_likes: $total_likes }
        ) {
          ...channel_post_reaction
        }
      }
      ${reactionFragment}
    `;
    const reactionInfo = await this.client.request<{
      update_channel_post_reactions_by_pk: ChannelPostLikeInfo;
    }>(query, { reaction_id, total_likes });
    return reactionInfo.update_channel_post_reactions_by_pk;
  }

  /**
   * @deprecated It's used in @function updateTotaReactionsOfChannelPostReaction() function
   * which is used by channel_post_reactions_conversations hasura event trigger
   * updates channel post reaction comment count
   */
  public async updateChannelPostReactionCommentCount(
    total_reactions: number,
    reaction_id: string,
  ) {
    const query = gql`
      mutation UpdateChannelPostReactionCommentCount(
        $reaction_id: uuid!
        $total_reactions: Int!
      ) {
        update_channel_post_reactions_by_pk(
          pk_columns: { id: $reaction_id }
          _set: { total_reactions: $total_reactions }
        ) {
          ...channel_post_reaction
        }
      }
      ${reactionFragment}
    `;
    const reactionInfo = await this.client.request<{
      update_channel_post_reactions_by_pk: ChannelPostLikeInfo;
    }>(query, { reaction_id, total_reactions });
    return reactionInfo.update_channel_post_reactions_by_pk;
  }

  /**
   * @deprecated It's used in @function updateTotaLikesOfChannelPostReactionComment() function
   * which is used by channel_post_reactions_conversations_likes hasura event trigger
   * get's information of a channel post
   */
  public async getChannelPostReactionCommentInfo(reaction_comment_id: string) {
    const query = gql`
      query GetChannelPostReactionCommentInfo($reaction_comment_id: uuid!) {
        channel_post_reactions_conversations_by_pk(id: $reaction_comment_id) {
          ...channel_post_reactions_conversation
        }
      }
      ${reactionCommentFragment}
    `;
    const reactionCommentInfo = await this.client.request<{
      channel_post_reactions_conversations_by_pk: ChannelPostReactionLikeInfo;
    }>(query, { reaction_comment_id });
    return reactionCommentInfo.channel_post_reactions_conversations_by_pk;
  }

  /**
   * @depreacted It's used in @function updateTotaLikesOfChannelPostReactionComment() function
   * which is used by channel_post_reactions_conversations_likes hasura event trigger
   * updates channel post reaction comment likes count
   */
  public async updateChannelPostReactionCommentLikesCount(
    total_likes: number,
    reaction_comment_id: string,
  ) {
    const query = gql`
      mutation UpdateChannelPostReactionCommentLikesCount(
        $reaction_comment_id: uuid!
        $total_likes: Int!
      ) {
        update_channel_post_reactions_conversations_by_pk(
          pk_columns: { id: $reaction_comment_id }
          _set: { total_likes: $total_likes }
        ) {
          ...channel_post_reaction
        }
      }
      ${reactionFragment}
    `;
    const reactionInfo = await this.client.request<{
      update_channel_post_reactions_conversations_by_pk: ChannelPostLikeInfo;
    }>(query, { reaction_comment_id, total_likes });
    return reactionInfo.update_channel_post_reactions_conversations_by_pk;
  }

  /**
   * @deprecated it's not used anywhere
   */
  getUserPostQuery(): string {
    const query = gql`
      query ($userId: uuid!, $postId: uuid!) {
        channel_user_posts(
          where: {
            _and: [{ user_id: { _eq: $userId } }, { id: { _eq: $postId } }]
          }
        ) {
          id
          user_id
          message
          image_url
          image_id
          file_path
          video_url
        }
      }
    `;
    return query;
  }

  /**
   * @deprecated it's not used anywhere
   */
  async getUserPost(userId: string, postId: string): Promise<UserPost> {
    const userPostQuery = this.getUserPostQuery();
    type result = UserPost[];
    const {
      channel_user_posts: [post],
    } = await this.client.request<Record<string, result>>(userPostQuery, {
      userId,
      postId,
    });
    return post;
  }

  /**
   * @deprecated It is used in @function getPostImagesAndVideos() function which is not been used
   */
  getPostVideosQuery(): string {
    const query = gql`
      query ($userId: uuid!, $postId: uuid!) {
        post_videos_aggregate(
          where: {
            _and: [{ user_id: { _eq: $userId } }, { post_id: { _eq: $postId } }]
          }
        ) {
          aggregate {
            count
          }
        }
      }
    `;
    return query;
  }

  /**
   * @deprecated It is used in @function getPostImagesAndVideos() function which is not been used
   */
  getPostImagesQuery(): string {
    const query = gql`
      query ($userId: uuid!, $postId: uuid!) {
        post_images_aggregate(
          where: {
            _and: [{ user_id: { _eq: $userId } }, { post_id: { _eq: $postId } }]
          }
        ) {
          aggregate {
            count
          }
        }
      }
    `;
    return query;
  }
  /**
   * @deprecated It is used in @function updateImageAndVideoOfPost() function which is not been used
   */
  async getPostImagesAndVideos(
    userId: string,
    postId: string,
  ): Promise<{ no_of_images: number; no_of_videos: number }> {
    const postImagesQuery = this.getPostImagesQuery();
    const postVideosQuery = this.getPostVideosQuery();
    type result = [
      { data: { post_images_aggregate: { aggregate: { count: number } } } },
      { data: { post_videos_aggregate: { aggregate: { count: number } } } },
    ];
    const requests = [
      {
        document: postImagesQuery,
        variables: { userId, postId },
      },
      {
        document: postVideosQuery,
        variables: { userId, postId },
      },
    ];
    const res = await this.client.batchRequests<result>(requests);
    const [
      {
        data: {
          post_images_aggregate: {
            aggregate: { count: no_of_images },
          },
        },
      },
      {
        data: {
          post_videos_aggregate: {
            aggregate: { count: no_of_videos },
          },
        },
      },
    ] = res;
    return {
      no_of_images: no_of_images,
      no_of_videos: no_of_videos,
    };
  }

  /**
   * @deprecated It is used in @function deleteVideo() function which is not been used
   */
  getDeletePostVideoMutation(): string {
    const mutation = gql`
      mutation ($userId: uuid!, $postId: uuid!) {
        delete_post_videos(
          where: {
            _and: [{ user_id: { _eq: $userId } }, { post_id: { _eq: $postId } }]
          }
        ) {
          returning {
            id
          }
        }
      }
    `;
    return mutation;
  }

  /**
   * @deprecated It is used in @function updateVideo() function which is not been used
   */
  getUpdatePostVideoMutation(): string {
    const mutation = gql`
      mutation ($videoId: uuid!, $videoInput: post_videos_set_input!) {
        update_post_videos_by_pk(
          pk_columns: { id: $videoId }
          _set: $videoInput
        ) {
          id
        }
      }
    `;
    return mutation;
  }

  /**
   * @deprecated It is used in @function insertVideo() function which is not been used
   */
  getInsertPostVideoMutation(): string {
    const mutation = gql`
      mutation ($videoInput: post_videos_insert_input!) {
        insert_post_videos_one(object: $videoInput) {
          id
        }
      }
    `;
    return mutation;
  }

  /**
   * @deprecated it's not used anywhere
   */
  getUpdatePostImageMutation(): string {
    const mutation = gql`
      mutation ($id: uuid!, $imagesInput: post_images_set_input!) {
        update_post_images_by_pk(pk_columns: { id: $id }, _set: $imagesInput) {
          id
        }
      }
    `;
    return mutation;
  }

  /**
   * @deprecated It is used in @function insertOneOrMultipleImage() function which is not been used
   */
  getInsertPostImagesMutation(): string {
    const mutation = gql`
      mutation ($imagesInput: [post_images_insert_input!]!) {
        insert_post_images(objects: $imagesInput) {
          returning {
            id
          }
        }
      }
    `;
    return mutation;
  }

  /**
   * @deprecated It is used in @function deleteOneImage() function which is not been used
   */
  getDeletePostImageOneMutation(): string {
    const mutation = gql`
      mutation ($imageId: uuid!) {
        delete_post_images_by_pk(id: $imageId) {
          id
        }
      }
    `;
    return mutation;
  }
  /**
   * @deprecated It is used in @function deleteAllImages() function which is not been used
   */
  getDeletePostImagesMutation(): string {
    const mutation = gql`
      mutation ($userId: uuid!, $postId: uuid!) {
        delete_post_images(
          where: {
            _and: [{ user_id: { _eq: $userId } }, { post_id: { _eq: $postId } }]
          }
        ) {
          returning {
            id
          }
        }
      }
    `;
    return mutation;
  }

  /**
   * @deprecated It is used in @function updateImageAndVideoOfPost() function which is not been used
   */
  async deleteOneImage(imageId: string): Promise<string> {
    const deletePostImageOneMutation = this.getDeletePostImageOneMutation();
    type result = { id: string };
    const { delete_post_images_by_pk } = await this.client.request<
      Record<string, result>
    >(deletePostImageOneMutation, {
      imageId,
    });
    if (delete_post_images_by_pk === null) {
      throw new NotFoundException('NO_IMAGE_FOUND_TO_BE_DELETED');
    }
    return delete_post_images_by_pk.id;
  }

  /**
   * @deprecated It is used in @function updateImageAndVideoOfPost() function which is not been used
   */
  async deleteAllImages(userId: string, postId: string): Promise<string[]> {
    const deletePostImagesMutation = this.getDeletePostImagesMutation();
    type result = { returning: { id: string }[] };
    const {
      delete_post_images: { returning },
    } = await this.client.request<Record<string, result>>(
      deletePostImagesMutation,
      {
        userId,
        postId,
      },
    );
    const deletedImageIds: string[] = returning.map((img) => img.id);
    return deletedImageIds;
  }

  /**
   * @deprecated It is used in @function updateImageAndVideoOfPost() function which is not been used
   */
  async insertOneOrMultipleImage(
    userId: string,
    postId: string,
    imagesInfo: { image_url: string; image_id: string; file_path: string }[],
  ): Promise<string[]> {
    const imagesInput = imagesInfo.map((img) => {
      return {
        user_id: userId,
        post_id: postId,
        ...img,
      };
    });
    const insertPostImagesMutation = this.getInsertPostImagesMutation();
    type result = { returning: { id: string }[] };
    const {
      insert_post_images: { returning },
    } = await this.client.request<Record<string, result>>(
      insertPostImagesMutation,
      {
        imagesInput,
      },
    );
    const insertedImageIds: string[] = returning.map((img) => img.id);
    return insertedImageIds;
  }

  /**
   * @deprecated It is used in @function updateImageAndVideoOfPost() function which is not been used
   */
  async updateVideo(
    userId: string,
    postId: string,
    videoId: string,
    videoInfo: { video_url: string },
  ): Promise<string> {
    const videoInput = {
      user_id: userId,
      post_id: postId,
      ...videoInfo,
    };
    const updatePostVideoMutation = this.getUpdatePostVideoMutation();
    type result = [{ data: { update_post_videos_by_pk: { id: string } } }];
    const requests = [
      {
        document: updatePostVideoMutation,
        variables: { videoId, videoInput },
      },
    ];
    const res = await this.client.batchRequests<result>(requests);
    const [
      {
        data: {
          update_post_videos_by_pk: { id },
        },
      },
    ] = res;
    return id;
  }
  /**
   * @deprecated It is used in @function updateImageAndVideoOfPost() function which is not been used
   */
  async insertVideo(
    userId: string,
    postId: string,
    videoInfo: { video_url: string },
  ): Promise<string> {
    const videoInput = {
      user_id: userId,
      post_id: postId,
      ...videoInfo,
    };
    const insertPostVideoMutation = this.getInsertPostVideoMutation();
    type result = [{ data: { insert_post_videos_one: { id: string } } }];
    const requests = [
      {
        document: insertPostVideoMutation,
        variables: { videoInput },
      },
    ];
    const res = await this.client.batchRequests<result>(requests);
    const [
      {
        data: {
          insert_post_videos_one: { id },
        },
      },
    ] = res;
    return id;
  }

  /**
   * @deprecated It is used in @function updateImageAndVideoOfPost() function which is not been used
   */
  async deleteVideo(userId: string, postId: string): Promise<string> {
    const deletePostVideoMutation = this.getDeletePostVideoMutation();
    type result = [
      { data: { delete_post_videos: { returning: { id: string }[] } } },
    ];
    const requests = [
      {
        document: deletePostVideoMutation,
        variables: { userId, postId },
      },
    ];
    const res = await this.client.batchRequests<result>(requests);
    const [
      {
        data: {
          delete_post_videos: { returning },
        },
      },
    ] = res;
    const deletedVideoIds: string[] = returning.map((video) => video.id);
    return deletedVideoIds[0];
  }
}
