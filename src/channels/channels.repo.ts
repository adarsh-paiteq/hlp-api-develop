import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { QueryResult } from 'pg';
import { Database } from '../core/modules/database/database.service';
import { HasuraService } from '../shared/services/hasura/hasura.service';
import { Users } from '../users/users.model';
import { ChannelPostReaction, ImageInput, VideoInput } from './channels.dto';
import {
  ChannelsFollowersCount,
  GetChannelsResponse,
  PayloadImage,
  PayloadVideo,
  UserPost,
} from './channels.model';
import { ChannelPostReactionConversationLikeDto } from './dto/channel-post-reaction-conversation-likes.dto';
import {
  UserPostInput,
  UserPostData,
  PostImageDto,
} from './dto/channel-user-post.dto';
import { PostReactionDto } from './dto/channel-user-reaction.dto';
import {
  ReportedPost,
  ReportedReactionConversation,
  ReportedReaction,
  reactionUpdateTableName,
  UpdateReactionCountDto,
  ReactionType,
  reactionTableName,
  reactionTableFieldName,
} from './dto/channel.dto';
import { FavouriteConversationDto } from './dto/favourite-converasation.dto';
import { FavouriteReactionDto } from './dto/favourite-reaction.dto';
import {
  ChannelWithTools,
  GetChannelPostsParams,
} from './dto/get-channel-details.dto';
import { MyChannel } from './dto/get-my-channels.dto';
import { ChannelDto } from './dto/get-my-groups.dto';
import { UserFeedPost } from './dto/get-user-feed.dto';
import { ChannelUserPostDto } from './dto/update-user-channel.dto';
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
import { PostImage } from './entities/post-image.entity';
import { PostVideo } from './entities/post-video.entity';
import { UserChannelFeed } from './entities/user-channel-feed.entity';
import { UserChannel } from './entities/user-channel.entity';
import { UserReportedPost } from './entities/user-reported-posts.entity';
import { UserReportedReactionConversation } from './entities/user-reported-reactions-conversations.entity';
import { UserReportedReaction } from './entities/user-reported-reactions.entity';
import { UserPollPostOption } from './entities/user-poll-post.entity';
import { ReactionWithConversations } from './dto/get-reaction-conversations.dto';
import {
  PostReactionDetail,
  UserPostDetail,
} from './dto/get-post-reactions.dto';
import { ChannelPostReactionConversationDto } from './dto/channel-post-reaction-conversation.dto';
import { PrivateChannelsData } from './dto/get-private-channels.dto';
import { UsersData } from './dto/user-channels.dto';
import { UserRoles } from '@users/users.dto';
@Injectable()
export class ChannelsRepo {
  private logger: Logger = new Logger();
  constructor(
    private readonly client: HasuraService,
    private readonly database: Database,
  ) {}

  public async getUserChannelById(userChannelId: string): Promise<UserChannel> {
    const query = `SELECT user_channels.* FROM user_channels WHERE user_channels.id = $1`;
    const [userChannel] = await this.database.query<UserChannel>(query, [
      userChannelId,
    ]);
    return userChannel;
  }

  public async getChannelUserPostById(
    postId: string,
  ): Promise<ChannelUserPost> {
    const query = `SELECT channel_user_posts.* FROM channel_user_posts WHERE channel_user_posts.id = $1`;
    const [userPost] = await this.database.query<ChannelUserPost>(query, [
      postId,
    ]);
    return userPost;
  }

  async getChannelsAndUserChannels(
    userId: string,
    organizationId: string,
    role: string,
    search?: string,
    lang?: string,
  ): Promise<GetChannelsResponse> {
    const channelsQuery = `SELECT channels.*,
       CASE
              WHEN channels.translations->> $4 IS NOT NULL
              THEN (channels.translations->>  $4 )::json->>'title'
              ELSE channels.title
              END AS title,  
              CASE
              WHEN channels.translations->>  $4 IS NOT NULL
              THEN (channels.translations->>  $4 )::json->>'short_description'
              ELSE channels.short_description
              END AS short_description,
                CASE
              WHEN channels.translations->>  $4 IS NOT NULL
              THEN (channels.translations->>  $4 )::json->>'description'
              ELSE channels.description
              END AS description,
    (
      SELECT
        CAST(COALESCE(COUNT(user_channels.*), '0') AS INTEGER)
      FROM
        user_channels
        RIGHT JOIN users ON users.id = user_channels.user_id
      WHERE
        user_channels.channel_id = channels.id
        AND user_channels.is_channel_unfollowed = $3
        AND channels.is_deleted = $3
    ) AS total_followers 
    FROM channels
    RIGHT JOIN organisation_channels ON organisation_channels.channel_id=channels.id
    WHERE channels.default_channel=$1 AND organisation_channels.organisation_id=$2 
      AND channels.is_deleted = $3
    ${role === UserRoles.DOCTOR ? `AND channels.is_private = $3` : ' '}
    ${
      search
        ? `AND (
      CASE
            WHEN channels.translations->> $4 IS NOT NULL
            THEN (channels.translations->> $4)::json->>'title' ILIKE $5
            ELSE channels.title ILIKE $5
            END)`
        : ''
    }
    ORDER BY channels.created_at DESC`;
    const channelsParams = [true, organizationId, false, lang];
    if (search) {
      channelsParams.push(`%${search}%`);
    }
    const trendingQuery = `SELECT
    channels.*,
     CASE
              WHEN channels.translations->> $3 IS NOT NULL
              THEN (channels.translations->> $3  )::json->>'title'
              ELSE channels.title
              END AS title,  
              CASE
              WHEN channels.translations->> $3  IS NOT NULL
              THEN (channels.translations->> $3  )::json->>'short_description'
              ELSE channels.short_description
              END AS short_description,
                CASE
              WHEN channels.translations->> $3  IS NOT NULL
              THEN (channels.translations->> $3  )::json->>'description'
              ELSE channels.description
              END AS description,
    (
      SELECT
        CAST(COALESCE(COUNT(user_channels.*), '0') AS INTEGER)
      FROM
        user_channels
      WHERE
        user_channels.channel_id = channels.id
        AND user_channels.is_channel_unfollowed = $1
    ) AS total_followers
  FROM
    channels
    JOIN organisation_channels ON organisation_channels.channel_id = channels.id
  WHERE
    channels.default_channel = $1
    AND organisation_channels.organisation_id = $2
    AND channels.is_private = $1
      AND channels.is_deleted = $1
    ${
      search
        ? `AND (
      CASE
            WHEN channels.translations->> $3  IS NOT NULL
            THEN (channels.translations->> $3 )::json->>'title' ILIKE $4
            ELSE channels.title ILIKE $4
            END)`
        : ' '
    }
  ORDER BY
    channels.created_at DESC;`;
    const trendingParams = [false, organizationId, lang];
    if (search) {
      trendingParams.push(`%${search}%`);
    }
    const userChannelsQuery = `SELECT channels.*,
     CASE
              WHEN channels.translations->> $4 IS NOT NULL
              THEN (channels.translations->> $4 )::json->>'title'
              ELSE channels.title
              END AS title,  
              CASE
              WHEN channels.translations->> $4 IS NOT NULL
              THEN (channels.translations->> $4 )::json->>'short_description'
              ELSE channels.short_description
              END AS short_description,
                CASE
              WHEN channels.translations->> $4 IS NOT NULL
              THEN (channels.translations->> $4 )::json->>'description'
              ELSE channels.description
              END AS description,
    (
      SELECT
        CAST(COALESCE(COUNT(user_channels.*), '0') AS INTEGER)
      FROM
        user_channels
        RIGHT JOIN users ON users.id = user_channels.user_id
      WHERE
        user_channels.channel_id = channels.id
        AND organisation_channels.organisation_id = users.organization_id
        AND user_channels.is_channel_unfollowed = $3
        AND channels.is_deleted = $3
    ) AS total_followers 
     FROM user_channels
    RIGHT JOIN channels ON channels.id=user_channels.channel_id
    RIGHT JOIN organisation_channels ON organisation_channels.channel_id=channels.id
    WHERE user_channels.user_id=$1 
    AND organisation_channels.organisation_id=$2 
    AND user_channels.is_channel_unfollowed=$3
    AND channels.is_deleted=$3
    ${role === UserRoles.DOCTOR ? `AND channels.is_private = $3` : ' '}
    ${
      search
        ? `AND (
      CASE
            WHEN channels.translations->> $4 IS NOT NULL
            THEN (channels.translations->> $4)::json->>'title' ILIKE $5
            ELSE channels.title ILIKE $5
            END)`
        : ' '
    }
    ORDER BY user_channels.created_at DESC
    `;
    const userChannelsParams = [userId, organizationId, false, lang];
    if (search) {
      userChannelsParams.push(`%${search}%`);
    }
    const [channels, trending, userChannels] = await Promise.all([
      this.database.query<Channel>(channelsQuery, channelsParams),
      this.database.query<Channel>(trendingQuery, trendingParams),
      this.database.query<Channel>(userChannelsQuery, userChannelsParams),
    ]);
    return {
      channels,
      trending,
      userChannels,
    };
  }

  async checkUserPost(userId: string, postId: string): Promise<number> {
    const checkUserPostQuery = `
    SELECT COUNT(*) as count FROM channel_user_posts
    WHERE user_id=$1 AND id=$2;
    `;
    const [data] = await this.database.query<{ count: number }>(
      checkUserPostQuery,
      [userId, postId],
    );
    return Number(data.count);
  }
  async updatePostMessage(
    userId: string,
    postId: string,
    message: string,
  ): Promise<string> {
    const updatedPostMessageQuery = `
    UPDATE channel_user_posts SET message=$1 WHERE user_id=$2 AND id=$3 RETURNING id;`;
    const [data] = await this.database.query<{ id: string }>(
      updatedPostMessageQuery,
      [message, userId, postId],
    );
    return data.id;
  }
  async getPostImagesAndVideos(
    userId: string,
    postId: string,
  ): Promise<{
    post: UserPost;
    images: PostImage[];
    videos: PostVideo[];
  }> {
    const postMessageQuery = `SELECT * FROM channel_user_posts WHERE user_id='${userId}' AND id='${postId}';`;
    const postImagesQuery = `SELECT * FROM post_images WHERE user_id='${userId}' AND post_id='${postId}';`;
    const postVideosQuery = `SELECT * FROM post_videos WHERE user_id='${userId}' AND post_id='${postId}';`;
    const batchQuery = postMessageQuery + postImagesQuery + postVideosQuery;
    type T = UserPost & PostImage & PostVideo;
    const data = await this.database.batchQuery<T>(batchQuery);
    const result = {
      post: data[0][0],
      images: data[1],
      videos: data[2],
    };
    return result;
  }
  async deleteOneImage(imageId: string): Promise<string[]> {
    const deletePostImageById = `DELETE FROM post_images WHERE id='${imageId}';`;
    const data = await this.database.batchQueryRaw(deletePostImageById);
    if (data.rowCount === 0)
      throw new NotFoundException('NO_IMAGE_FOUND_TO_BE_DELETED');
    return [imageId];
  }
  async deleteAllImages(userId: string, postId: string): Promise<string[]> {
    const deleteAllImageQuery = `
    DELETE FROM post_images WHERE user_id='${userId}' AND post_id='${postId}' RETURNING id;`;
    const data = await this.database.batchQueryRaw<PostImage>(
      deleteAllImageQuery,
    );
    const { rowCount, rows } = data[0];
    if (rowCount === rows.length) {
      return rows.map((row: { id: string }) => row.id);
    }
    throw new Error(`SOMETHING_WENT_WRONG`);
  }
  async insertOneOrMultipleImage(
    userId: string,
    postId: string,
    imagesInfo: PayloadImage[],
  ): Promise<string[]> {
    const deletedImages = await this.deleteAllImages(userId, postId);
    this.logger.log(
      `${deletedImages.length}: images auto-deleted due to insertion of new images`,
    );
    const deletedVideo = await this.deleteVideo(userId, postId);
    this.logger.log(
      `${deletedVideo.length}: video auto-deleted due to insertion of new images`,
    );
    const imageInputs: Array<ImageInput> = imagesInfo.map((img) => {
      return {
        user_id: userId,
        post_id: postId,
        ...img,
      };
    });
    const multiInsertQuery = imageInputs.reduce((acc, imageInput) => {
      const query = `
    INSERT INTO post_images (user_id, post_id, image_url, image_id, file_path) VALUES('${imageInput.user_id}', '${imageInput.post_id}','${imageInput.image_url}', '${imageInput.image_id}', '${imageInput.file_path}') RETURNING id;`;
      return acc + query;
    }, ``);
    const results = await this.database.batchQueryRaw<{ id: string }>(
      multiInsertQuery,
    );
    const data: string[] = results.map((result: QueryResult) => {
      return result.rows[0].id;
    });
    if (data.length !== imageInputs.length) {
      throw new Error(`SOMETHING_WENT_WRONG`);
    }
    return data;
  }
  async insertVideo(
    userId: string,
    postId: string,
    videoInfo: PayloadVideo[],
  ): Promise<string[]> {
    const videoInputs: VideoInput[] = videoInfo.map((img) => {
      return {
        user_id: userId,
        post_id: postId,
        ...img,
      };
    });
    const deletedVideo = await this.deleteVideo(userId, postId);
    this.logger.log(
      `${deletedVideo.length}: video auto-deleted due to insertion of new video`,
    );
    const deletedImages = await this.deleteAllImages(userId, postId);
    this.logger.log(
      `${deletedImages.length}: images auto-deleted due to insertion of new video`,
    );
    const videoInsertQuery = videoInputs.reduce((acc: string, videoInput) => {
      const query = `
    INSERT INTO post_videos (user_id, post_id, thumb_nail_image_url, thumbnail_image_id, thumbnail_image_id_path, video_url, video_id, video_path) VALUES('${videoInput.user_id}', '${videoInput.post_id}', '${videoInput.thumb_nail_image_url}', '${videoInput.thumbnail_image_id}', '${videoInput.thumbnail_image_id_path}', '${videoInput.video_url}', '${videoInput.video_id}', '${videoInput.video_path}') RETURNING id;`;
      return acc + query;
    }, ``);
    const results = await this.database.batchQueryRaw<{ id: string }>(
      videoInsertQuery,
    );
    const data: string[] = results.map((result: QueryResult) => {
      return result.rows[0].id;
    });
    if (data.length !== videoInputs.length) {
      throw new Error(`SOMETHING_WENT_WRONG`);
    }
    return data;
  }
  async deleteVideo(userId: string, postId: string): Promise<string[]> {
    const deletedVideoQuery = `
    DELETE FROM post_videos WHERE user_id='${userId}' AND post_id='${postId}' RETURNING id;`;
    const data = await this.database.batchQueryRaw<PostVideo>(
      deletedVideoQuery,
    );
    const { rowCount, rows } = data[0];
    if (rowCount === rows.length) {
      return rows.map((row: { id: string }) => row.id);
    }
    throw new Error(`SOMETHING_WENT_WRONG`);
  }
  async insertOneOrMultipleImagesAndVideo(
    userId: string,
    postId: string,
    videoInfo: PayloadVideo[],
    imagesInfo: PayloadImage[],
  ): Promise<string[]> {
    const deletedImages = await this.deleteAllImages(userId, postId);
    this.logger.log(
      `${deletedImages.length}: images auto-deleted due to insertion of new images`,
    );
    const deletedVideo = await this.deleteVideo(userId, postId);
    this.logger.log(
      `${deletedVideo.length}: video auto-deleted due to insertion of new images`,
    );
    const imageInputs: Array<ImageInput> = imagesInfo.map((img) => {
      return {
        user_id: userId,
        post_id: postId,
        ...img,
      };
    });
    const videoInputs: VideoInput[] = videoInfo.map((img) => {
      return {
        user_id: userId,
        post_id: postId,
        ...img,
      };
    });
    const multiInsertQuery = imageInputs.reduce((acc, imageInput) => {
      const query = `
      INSERT INTO post_images (user_id, post_id, image_url, image_id, file_path)
      VALUES('${imageInput.user_id}',
      '${imageInput.post_id}',
      '${imageInput.image_url}',
      '${imageInput.image_id}',
      '${imageInput.file_path}')
      RETURNING id;`;
      return acc + query;
    }, ``);
    const videoInsertQuery = videoInputs.reduce((acc: string, videoInput) => {
      const query = `
      INSERT INTO post_videos
      (user_id, post_id, thumb_nail_image_url, thumbnail_image_id, thumbnail_image_id_path, video_url, video_id, video_path)
      VALUES('${videoInput.user_id}',
      '${videoInput.post_id}',
      '${videoInput.thumb_nail_image_url}',
      '${videoInput.thumbnail_image_id}',
      '${videoInput.thumbnail_image_id_path}',
      '${videoInput.video_url}',
      '${videoInput.video_id}',
      '${videoInput.video_path}')
      RETURNING id;`;
      return acc + query;
    }, ``);
    const imageResult = await this.database.batchQueryRaw<{ id: string }>(
      multiInsertQuery,
    );
    const videoResult = await this.database.batchQueryRaw<{ id: string }>(
      videoInsertQuery,
    );
    const imageData: string[] = imageResult.map((result: QueryResult) => {
      return result.rows[0].id;
    });
    const videoData: string[] = videoResult.map((result: QueryResult) => {
      return result.rows[0].id;
    });
    const data = [...imageData, ...videoData];
    if (imageData.length !== imageInputs.length) {
      throw new Error(`SOMETHING_WENT_WRONG`);
    }
    if (videoData.length !== videoInputs.length) {
      throw new Error(`SOMETHING_WENT_WRONG`);
    }
    return data;
  }

  async getChannelFollowers(channelId: string): Promise<number> {
    const query = `SELECT COUNT(user_channels.user_id) AS followers FROM user_channels
    WHERE user_channels.channel_id= $1 AND user_channels.is_channel_unfollowed= $2
    `;
    const [{ followers }] = await this.database.query<{ followers: number }>(
      query,
      [channelId, 'false'],
    );
    return followers;
  }

  async updateChannelFollowersCount(
    channelId: string,
    followers: number,
  ): Promise<Channel> {
    const query = `UPDATE channels SET total_followers= $1 WHERE channels.id= $2 RETURNING *`;
    const [channel] = await this.database.query<Channel>(query, [
      followers,
      channelId,
    ]);
    return channel;
  }

  async getChannelsFollowersCount(): Promise<ChannelsFollowersCount[]> {
    const query = `SELECT COUNT(user_channels.user_id) AS followers,
    user_channels.channel_id FROM user_channels
    WHERE user_channels.is_channel_unfollowed = false
    GROUP BY user_channels.channel_id`;

    const followersCount = await this.database.query<ChannelsFollowersCount>(
      query,
    );
    return followersCount;
  }

  async updateChannelsFollowersCount(
    followersCount: ChannelsFollowersCount[],
  ): Promise<Channel[]> {
    let batchQuery = `SELECT * FROM channels; `;
    followersCount.map((channel) => {
      batchQuery =
        batchQuery +
        `UPDATE channels SET total_followers=${channel.followers} WHERE channels.id='${channel.channel_id}'; `;
    });

    const [channel] = await this.database.batchQuery<Channel>(batchQuery);
    return channel;
  }

  async getChannelUsers(channelId: string): Promise<Users[]> {
    const query = `SELECT users.* FROM user_channels
    JOIN users ON users.id=user_channels.user_id
    WHERE user_channels.channel_id=$1 AND user_channels.is_channel_unfollowed = false`;
    const channels = await this.database.query<Users>(query, [channelId]);
    return channels;
  }

  async saveChannelPostReaction(
    channelPostReaction: PostReactionDto,
  ): Promise<ChannelPostReactions> {
    const query = `INSERT INTO channel_post_reactions (${Object.keys(
      channelPostReaction,
    )}) VALUES (${Object.keys(channelPostReaction).map(
      (value, index) => `$${index + 1}`,
    )}) RETURNING *;`;

    const [channelPostReactionNew] =
      await this.database.query<ChannelPostReactions>(
        query,
        Object.values(channelPostReaction),
      );
    return channelPostReactionNew;
  }

  async disableUserPost(postId: string): Promise<ChannelUserPost> {
    const query = `UPDATE channel_user_posts SET is_post_disabled_by_user= $1 WHERE id= $2 RETURNING *`;
    const [userPost] = await this.database.query<ChannelUserPost>(query, [
      'true',
      postId,
    ]);
    return userPost;
  }

  public async getUserChannel(
    userId: string,
    channelId: string,
  ): Promise<UserChannel> {
    const query = `SELECT * FROM  user_channels
    WHERE user_id = $1 AND channel_id = $2
    `;
    const [userChannel] = await this.database.query<UserChannel>(query, [
      userId,
      channelId,
    ]);
    return userChannel;
  }

  async userfollowChannel(
    channelId: string,
    userId: string,
  ): Promise<UserChannel> {
    const query = `INSERT INTO user_channels(channel_id, user_id, is_channel_unfollowed)
    VALUES ($1, $2, $3) RETURNING *`;
    const [channels] = await this.database.query<UserChannel>(query, [
      channelId,
      userId,
      'false',
    ]);
    return channels;
  }

  public async getFavouritePost(
    userId: string,
    postId: string,
  ): Promise<FavouritePost> {
    const query = `SELECT * FROM  favourite_posts WHERE user_id = $1 AND post_id = $2`;
    const [favouritePost] = await this.database.query<FavouritePost>(query, [
      userId,
      postId,
    ]);
    return favouritePost;
  }

  async addFavouritePost(
    userId: string,
    postId: string,
    postCreatorId: string,
  ): Promise<FavouritePost> {
    const query = `INSERT INTO favourite_posts(user_id, post_id, post_creator_id)
    VALUES ($1, $2, $3) RETURNING *`;
    const [favoritePostNew] = await this.database.query<FavouritePost>(query, [
      userId,
      postId,
      postCreatorId,
    ]);
    return favoritePostNew;
  }

  async removeFavouritePost(
    userId: string,
    postId: string,
  ): Promise<FavouritePost> {
    const query = `DELETE FROM favourite_posts WHERE user_id= $1 AND post_id =$2 RETURNING *`;
    const [userPost] = await this.database.query<FavouritePost>(query, [
      userId,
      postId,
    ]);
    return userPost;
  }

  public async getChannelPostLike(
    userId: string,
    postId: string,
    channelId: string,
  ): Promise<ChannelPostLikes> {
    const query = `SELECT * FROM channel_post_likes WHERE user_id = $1 AND post_id = $2 AND channel_id = $3`;
    const [postLike] = await this.database.query<ChannelPostLikes>(query, [
      userId,
      postId,
      channelId,
    ]);
    return postLike;
  }

  async addChannelPostLike(
    userId: string,
    postId: string,
    channelId: string,
  ): Promise<ChannelPostLikes> {
    const query = `INSERT INTO channel_post_likes(user_id, post_id, channel_id)
    VALUES ($1, $2, $3) RETURNING *`;
    const [channelPostLikeNew] = await this.database.query<ChannelPostLikes>(
      query,
      [userId, postId, channelId],
    );
    return channelPostLikeNew;
  }

  async updateLikesCount(
    id: string,
    tableName: string,
    totalLikes: number,
  ): Promise<ChannelUserPost | ChannelPostReactions | ChannelPostConversation> {
    const query = `UPDATE ${tableName} SET total_likes= $1 WHERE id= $2 RETURNING *`;
    const [updateUserPost] = await this.database.query<
      ChannelUserPost | ChannelPostReaction | ChannelPostConversation
    >(query, [totalLikes, id]);
    return updateUserPost;
  }

  async userUnfollowChannel(
    channelId: string,
    userId: string,
  ): Promise<UserChannel> {
    const query = `UPDATE user_channels SET is_channel_unfollowed= $1 WHERE channel_id= $2 AND user_id= $3 RETURNING *`;
    const [channel] = await this.database.query<UserChannel>(query, [
      'true',
      channelId,
      userId,
    ]);
    return channel;
  }

  async removePostLike(
    userId: string,
    postId: string,
    channelId: string,
  ): Promise<ChannelPostLikes> {
    const query = `DELETE FROM channel_post_likes WHERE user_id= $1 AND post_id= $2 AND channel_id=$3 RETURNING *`;
    const [removePostLike] = await this.database.query<ChannelPostLikes>(
      query,
      [userId, postId, channelId],
    );
    return removePostLike;
  }

  async updateChannelFollowStatusById(
    id: string,
    is_channel_unfollowed: boolean,
  ): Promise<UserChannel> {
    const query = `UPDATE
    user_channels
    SET
    is_channel_unfollowed = $1
    WHERE
    id = $2 RETURNING *`;
    const [channel] = await this.database.query<UserChannel>(query, [
      is_channel_unfollowed,
      id,
    ]);
    return channel;
  }

  async savePost(userPost: UserPostData): Promise<ChannelUserPost> {
    const query = `INSERT INTO channel_user_posts (${Object.keys(
      userPost,
    )}) VALUES (${Object.keys(userPost).map(
      (value, index) => `$${index + 1}`,
    )}) RETURNING *;`;
    const [userPostNew] = await this.database.query<ChannelUserPost>(
      query,
      Object.values(userPost),
    );
    return userPostNew;
  }

  async getUserPostDetails(
    userId: string,
    postId: string,
  ): Promise<UserPostDetail> {
    const query = `
    ${this.prepareUserPostAggregations()}
    FROM channel_user_posts
    ${this.prepareUserPostAggragationJoins()}
    WHERE
    channel_user_posts.id =$2
    AND channel_user_posts.is_post_disabled_by_admin = 'false'
    AND channel_user_posts.is_post_disabled_by_user = 'false'
    GROUP BY channel_user_posts.id, users.id, favourite_posts.id`;
    const [userPost] = await this.database.query<UserPostDetail>(query, [
      userId,
      postId,
    ]);
    return userPost;
  }

  async getPostReactionDetails(
    userId: string,
    postId: string,
  ): Promise<PostReactionDetail[]> {
    const query = `
    ${this.prepareChannelPostReactionAggragation()}
    FROM channel_user_posts
    ${this.prepareChannelPostReactionAggragationJoins()}
    WHERE
    channel_user_posts.id =$2
    AND channel_user_posts.is_post_disabled_by_admin = 'false'
    AND channel_user_posts.is_post_disabled_by_user = 'false'
    GROUP BY channel_post_reactions.id, users.id
    ORDER BY channel_post_reactions.created_at DESC
     `;
    const postReaction = await this.database.query<PostReactionDetail>(query, [
      userId,
      postId,
    ]);
    return postReaction;
  }

  public async getUserPostById(postId: string): Promise<ChannelUserPost> {
    const query = `SELECT * FROM  channel_user_posts WHERE channel_user_posts.id = $1`;
    const [userPost] = await this.database.query<ChannelUserPost>(query, [
      postId,
    ]);
    return userPost;
  }

  async updatePostById(
    postId: string,
    updates: UserPostInput,
  ): Promise<ChannelUserPost> {
    const parameters = [...Object.values(updates), postId];
    const query =
      'UPDATE channel_user_posts SET ' +
      Object.keys(updates)
        .map((key, index) => `${key} = $${index + 1}`)
        .join(', ') +
      ` WHERE id = $${parameters.length} RETURNING *;`;
    const [updatedPost] = await this.database.query<ChannelUserPost>(
      query,
      parameters,
    );
    return updatedPost;
  }

  async savePostImages(saveImages: PostImageDto[]): Promise<PostImage[]> {
    let batchQuery = ` `;
    saveImages.map((saveImage) => {
      batchQuery =
        batchQuery +
        ' INSERT INTO post_images (' +
        Object.keys(saveImage)
          .map((key) => `${key}`)
          .join(', ') +
        ') VALUES (' +
        Object.values(saveImage)
          .map((value) => `'${value}'`)
          .join(', ') +
        ') RETURNING *; ';
    });
    const savePostImage = await this.database.batchQuery<PostImage[]>(
      batchQuery,
    );
    const image = savePostImage.reduce((acc, val) => acc.concat(val), []);
    return image.flat();
  }

  async disableUserPostReaction(
    reactionId: string,
  ): Promise<ChannelPostReaction> {
    const query = `UPDATE channel_post_reactions SET is_reaction_disabled_by_user= $1 WHERE id= $2 RETURNING *`;
    const [postReaction] = await this.database.query<ChannelPostReaction>(
      query,
      ['true', reactionId],
    );
    return postReaction;
  }

  async disableUserPostReactionComment(
    conversationId: string,
  ): Promise<ChannelPostConversation> {
    const query = `UPDATE channel_post_reactions_conversations SET is_conversation_disabled_by_user= $1 WHERE id= $2 RETURNING *`;
    const [postReactionConversation] =
      await this.database.query<ChannelPostConversation>(query, [
        'true',
        conversationId,
      ]);
    return postReactionConversation;
  }

  public async getFavouriteReaction(
    userId: string,
    reactionId: string,
    postId: string,
  ): Promise<FavouriteReaction> {
    const query = `SELECT * FROM favourite_reactions WHERE user_id = $1 AND reaction_id = $2 AND post_id = $3`;
    const [favoriteReaction] = await this.database.query<FavouriteReaction>(
      query,
      [userId, reactionId, postId],
    );
    return favoriteReaction;
  }

  async addFavoriteReaction(
    favoriteReaction: FavouriteReactionDto,
  ): Promise<FavouriteReaction> {
    const query = `INSERT INTO favourite_reactions (${Object.keys(
      favoriteReaction,
    )}) VALUES (${Object.keys(favoriteReaction).map(
      (value, index) => `$${index + 1}`,
    )}) RETURNING *;`;
    const [favoriteReactionNew] = await this.database.query<FavouriteReaction>(
      query,
      Object.values(favoriteReaction),
    );
    return favoriteReactionNew;
  }

  async removeFavouriteReaction(
    userId: string,
    postId: string,
    reactionId: string,
  ): Promise<FavouriteReaction> {
    const query = `DELETE FROM favourite_reactions WHERE user_id= $1 AND post_id =$2 AND reaction_id=$3 RETURNING *`;
    const [postReaction] = await this.database.query<FavouriteReaction>(query, [
      userId,
      postId,
      reactionId,
    ]);
    return postReaction;
  }

  public async getChannelPostReactionLike(
    userId: string,
    postId: string,
    channelId: string,
    reactionId: string,
  ): Promise<ChannelPostReactionLike> {
    const query = `SELECT * FROM channel_post_reactions_likes WHERE user_id = $1 AND post_id = $2 AND channel_id = $3 AND reaction_id=$4`;
    const [postReactionLike] =
      await this.database.query<ChannelPostReactionLike>(query, [
        userId,
        postId,
        channelId,
        reactionId,
      ]);
    return postReactionLike;
  }

  async addLikeChannelPostReaction(
    userId: string,
    postId: string,
    channelId: string,
    reactionId: string,
  ): Promise<ChannelPostReactionLike> {
    const query = `INSERT INTO channel_post_reactions_likes(user_id, post_id, channel_id, reaction_id)
    VALUES ($1, $2, $3, $4) RETURNING *`;
    const [reactionLikeNew] =
      await this.database.query<ChannelPostReactionLike>(query, [
        userId,
        postId,
        channelId,
        reactionId,
      ]);
    return reactionLikeNew;
  }

  async removePostReactionLike(
    userId: string,
    postId: string,
    channelId: string,
    reactionId: string,
  ): Promise<ChannelPostReactionLike> {
    const query = `DELETE FROM channel_post_reactions_likes WHERE user_id= $1 AND post_id= $2 AND channel_id=$3 AND reaction_id=$4 RETURNING *`;
    const [removePostLike] = await this.database.query<ChannelPostReactionLike>(
      query,
      [userId, postId, channelId, reactionId],
    );
    return removePostLike;
  }

  async addReactionConversationLike(
    reactionConversationLike: ChannelPostReactionConversationLikeDto,
  ): Promise<ChannelPostReactionConversationLikes> {
    const query = `INSERT INTO channel_post_reactions_conversations_likes (${Object.keys(
      reactionConversationLike,
    )}) VALUES (${Object.keys(reactionConversationLike).map(
      (value, index) => `$${index + 1}`,
    )}) RETURNING *;`;
    const [conversationLikeNew] =
      await this.database.query<ChannelPostReactionConversationLikes>(
        query,
        Object.values(reactionConversationLike),
      );
    return conversationLikeNew;
  }

  public async getReactionConversationLike(
    userId: string,
    reactionId: string,
    conversationId: string,
  ): Promise<ChannelPostReactionConversationLikes> {
    const query = `SELECT * FROM channel_post_reactions_conversations_likes WHERE user_id = $1 AND reaction_id = $2 AND conversation_id = $3`;
    const [conversationLike] =
      await this.database.query<ChannelPostReactionConversationLikes>(query, [
        userId,
        reactionId,
        conversationId,
      ]);
    return conversationLike;
  }

  async removeConversationLike(
    userId: string,
    reactionId: string,
    conversationId: string,
  ): Promise<ChannelPostReactionConversationLikes> {
    const query = `DELETE FROM channel_post_reactions_conversations_likes WHERE user_id = $1 AND reaction_id = $2 AND conversation_id = $3 RETURNING *`;
    const [removeConversationLike] =
      await this.database.query<ChannelPostReactionConversationLikes>(query, [
        userId,
        reactionId,
        conversationId,
      ]);
    return removeConversationLike;
  }

  async updateReactionById(
    postReactionId: string,
    message: string,
  ): Promise<ChannelPostReactions> {
    const query = `UPDATE channel_post_reactions SET message= $1 WHERE id= $2 RETURNING *`;
    const [postReaction] = await this.database.query<ChannelPostReactions>(
      query,
      [message, postReactionId],
    );
    return postReaction;
  }

  public async getFavouriteReactionConversation(
    userId: string,
    reactionId: string,
    conversationId: string,
  ): Promise<FavouriteConversation> {
    const query = `SELECT * FROM favourite_conversations
    WHERE user_id = $1 AND reaction_id = $2 AND conversation_id = $3
    `;
    const [reactionConversation] =
      await this.database.query<FavouriteConversation>(query, [
        userId,
        reactionId,
        conversationId,
      ]);
    return reactionConversation;
  }

  async addFavouriteReactionConversation(
    favoriteConversation: FavouriteConversationDto,
  ): Promise<FavouriteConversation> {
    const query = `INSERT INTO favourite_conversations (${Object.keys(
      favoriteConversation,
    )}) VALUES (${Object.keys(favoriteConversation).map(
      (value, index) => `$${index + 1}`,
    )}) RETURNING *;`;
    const [favoriteConversationNew] =
      await this.database.query<FavouriteConversation>(
        query,
        Object.values(favoriteConversation),
      );
    return favoriteConversationNew;
  }

  async removeFavouriteConversation(
    userId: string,
    reactionId: string,
    conversationId: string,
  ): Promise<FavouriteConversation> {
    const query = `DELETE FROM favourite_conversations WHERE user_id= $1 AND reaction_id =$2 AND conversation_id=$3 RETURNING *`;
    const [reactionConversation] =
      await this.database.query<FavouriteConversation>(query, [
        userId,
        reactionId,
        conversationId,
      ]);
    return reactionConversation;
  }

  async updateReactionConversationById(
    conversationId: string,
    message: string,
  ): Promise<ChannelPostConversation> {
    const query = `UPDATE channel_post_reactions_conversations SET message= $1 WHERE id= $2 RETURNING *`;
    const [reactionConversation] =
      await this.database.query<ChannelPostConversation>(query, [
        message,
        conversationId,
      ]);
    return reactionConversation;
  }
  async saveUserReportReactionConversation(
    reportReactionConversation: ReportedReactionConversation,
  ): Promise<UserReportedReactionConversation> {
    const query = `INSERT INTO user_reported_reaction_conversations (${Object.keys(
      reportReactionConversation,
    )}) VALUES (${Object.keys(reportReactionConversation).map(
      (value, index) => `$${index + 1}`,
    )}) RETURNING *;`;
    const [reactionConversation] =
      await this.database.query<UserReportedReactionConversation>(
        query,
        Object.values(reportReactionConversation),
      );
    return reactionConversation;
  }

  async saveUserReportedPost(
    userReportPost: ReportedPost,
  ): Promise<UserReportedPost> {
    const query = `INSERT INTO user_reported_posts (${Object.keys(
      userReportPost,
    )}) VALUES (${Object.keys(userReportPost).map(
      (value, index) => `$${index + 1}`,
    )}) RETURNING *;`;

    const [reportPost] = await this.database.query<UserReportedPost>(
      query,
      Object.values(userReportPost),
    );
    return reportPost;
  }

  async saveUserReportedReaction(
    userReportReaction: ReportedReaction,
  ): Promise<UserReportedReaction> {
    const query = `INSERT INTO user_reported_reactions (${Object.keys(
      userReportReaction,
    )}) VALUES (${Object.keys(userReportReaction).map(
      (value, index) => `$${index + 1}`,
    )}) RETURNING *;`;

    const [reportReaction] = await this.database.query<UserReportedReaction>(
      query,
      Object.values(userReportReaction),
    );
    return reportReaction;
  }

  async saveChannelPostReactionConversation(
    channelPostConversation: ChannelPostReactionConversationDto,
  ): Promise<ChannelPostConversation> {
    const query = `INSERT INTO channel_post_reactions_conversations (${Object.keys(
      channelPostConversation,
    ).toString()}) VALUES (${Object.keys(channelPostConversation)
      .map((value, index) => `$${index + 1}`)
      .toString()}) RETURNING *;`;

    const [saveChannelPostReaction] =
      await this.database.query<ChannelPostConversation>(
        query,
        Object.values(channelPostConversation),
      );
    return saveChannelPostReaction;
  }

  async getUserById(id: string): Promise<Users> {
    const query = `SELECT * FROM users WHERE id=$1`;
    const [user] = await this.database.query<Users>(query, [id]);
    return user;
  }

  async getChannelById(id: string): Promise<Channel> {
    const query = `SELECT * FROM channels WHERE id=$1`;
    const [channel] = await this.database.query<Channel>(query, [id]);
    return channel;
  }

  async getLastChannelPostFromUserChannelFeed(
    userId: string,
    channelId: string,
  ): Promise<ChannelUserPost | undefined> {
    const query = `SELECT channel_user_posts.* FROM user_channels_feed
    JOIN channel_user_posts ON channel_user_posts.id=user_channels_feed.post_id
    WHERE user_channels_feed.user_id=$1 AND user_channels_feed.channel_id=$2 ORDER BY user_channels_feed.created_at DESC LIMIT 1`;
    const [post] = await this.database.query<ChannelUserPost>(query, [
      userId,
      channelId,
    ]);
    return post;
  }

  async getChannelUserPostsByDate(
    channelId: string,
    startDate?: string,
  ): Promise<ChannelUserPost[]> {
    let query = `SELECT * FROM channel_user_posts
    WHERE channel_id=$1`;
    let params: unknown[] = [channelId];
    if (startDate) {
      query += `AND  created_at::date>$2;`;
      params = [...params, startDate];
    }
    const posts = await this.database.query<ChannelUserPost>(query, params);
    return posts;
  }

  async addToUserChannelFeed(
    feed: Pick<UserChannelFeed, 'channel_id' | 'post_id' | 'user_id'>[],
  ): Promise<UserChannelFeed[]> {
    const [post] = feed;
    const query = `INSERT INTO user_channels_feed (${Object.keys(post).join(
      ',',
    )}) VALUES ${feed.map(
      (post) =>
        `(${Object.values(post)
          .map((value) => `'${value}'`)
          .join(',')})`,
    )}`;
    const data = await this.database.query<UserChannelFeed>(query);
    return data;
  }

  async updateUserChannelFeedPostsStatus(
    userId: string,
    channelId: string,
    hide: boolean,
  ): Promise<UserChannelFeed[]> {
    const query = `UPDATE user_channels_feed SET hide=$3 WHERE user_id=$1 AND channel_id=$2 RETURNING *`;
    const feed = await this.database.query<UserChannelFeed>(query, [
      userId,
      channelId,
      hide,
    ]);
    return feed;
  }

  async getUserChannels(userId: string): Promise<ChannelDto[]> {
    const query = `SELECT channels.*,user_channels.has_new_post,user_channels.last_post_created_at FROM user_channels
    JOIN channels ON channels.id=user_channels.channel_id
    WHERE user_channels.user_id=$1 AND user_channels.is_channel_unfollowed=false
    ORDER BY user_channels.has_new_post DESC,
    user_channels.last_post_created_at DESC`;
    const channels = await this.database.query<ChannelDto>(query, [userId]);
    return channels;
  }

  async addUserChannel(
    userChannel: Pick<
      UserChannel,
      'channel_id' | 'user_id' | 'is_channel_unfollowed' | 'organisation_id'
    >,
  ): Promise<UserChannel> {
    const query = `INSERT INTO user_channels (user_id,channel_id,is_channel_unfollowed,organisation_id) VALUES($1,$2,$3,$4) RETURNING *`;
    const [savedUserChannel] = await this.database.query<UserChannel>(
      query,
      Object.values(userChannel),
    );
    return savedUserChannel;
  }

  async updateUserChannel(
    userId: string,
    channelId: string,
    follow: boolean,
  ): Promise<UserChannel> {
    const query = `UPDATE user_channels SET is_channel_unfollowed=$3 WHERE user_id=$1 AND channel_id=$2 RETURNING *`;
    const [updatedUserChannel] = await this.database.query<UserChannel>(query, [
      userId,
      channelId,
      follow,
    ]);
    return updatedUserChannel;
  }

  async getChannelLastPost(
    userId: string,
    channelId: string,
  ): Promise<ChannelUserPostDto> {
    const query = `SELECT *,CASE
    WHEN channel_user_posts.id=user_channels_feed.post_id THEN true ELSE false
    END AS is_exists
    FROM channel_user_posts
    LEFT JOIN user_channels_feed ON user_channels_feed.post_id=channel_user_posts.id AND user_channels_feed.user_id=$1
    WHERE channel_user_posts.channel_id=$2 AND channel_user_posts.is_post_disabled_by_admin=false AND channel_user_posts.is_post_disabled_by_user=false ORDER BY channel_user_posts.created_at DESC
    LIMIT 1`;
    const [post] = await this.database.query<ChannelUserPostDto>(query, [
      userId,
      channelId,
    ]);
    return post;
  }

  async updateUserChannelLastPostDate(
    userId: string,
    channelId: string,
    lastPostCreatedAt: string,
  ): Promise<UserChannel> {
    const query = `UPDATE user_channels SET has_new_post=$4,last_post_created_at=$3 WHERE user_id=$1 AND channel_id=$2 RETURNING *`;
    const hasNewPost = true;
    const [updatedUserChannel] = await this.database.query<UserChannel>(query, [
      userId,
      channelId,
      lastPostCreatedAt,
      hasNewPost,
    ]);
    return updatedUserChannel;
  }

  async getUserChannelsWithLatestPost(
    userId: string,
    organizationId: string,
  ): Promise<MyChannel[]> {
    const query = `SELECT
    ROW_TO_JSON(channels.*) AS channel,
    ROW_TO_JSON(channel_user_posts.*) AS latest_post,
    CASE
        WHEN channel_user_posts.user_id = $1 THEN true
        WHEN channel_user_posts.id IS NULL THEN true
        ELSE COALESCE(user_channels_feed.viewed, false)
    END AS is_viewed
FROM
    channels
    LEFT OUTER JOIN (
        SELECT
            channel_id,
            MAX(created_at) AS latest_post_created_at
        FROM
            channel_user_posts
        WHERE
            user_id NOT IN (
                SELECT blocked_user_id FROM blocked_users WHERE blocked_by_user_id = $1
            ) AND channel_user_posts.id IN(
              SELECT user_channels_feed.post_id FROM user_channels_feed WHERE user_channels_feed.user_id = $1
              AND user_channels_feed.post_id = channel_user_posts.id
            )AND is_post_disabled_by_user = false AND is_post_disabled_by_admin = false
            AND( channel_user_posts.added_by = 'user'
                OR( channel_user_posts.added_by = 'admin' AND channel_user_posts.post_render_date ::DATE = CURRENT_DATE )
            )
        GROUP BY
            channel_id
    ) AS latest_posts ON channels.id = latest_posts.channel_id
    LEFT JOIN channel_user_posts ON latest_posts.channel_id = channel_user_posts.channel_id AND latest_posts.latest_post_created_at = channel_user_posts.created_at
    LEFT JOIN user_channels_feed ON user_channels_feed.post_id = channel_user_posts.id AND user_channels_feed.user_id = $1
    JOIN user_channels ON user_channels.channel_id = channels.id
    JOIN organisation_channels ON organisation_channels.channel_id = channels.id
WHERE
    user_channels.user_id = $1 AND user_channels.is_channel_unfollowed = false AND organisation_channels.organisation_id=$2
    ORDER BY CASE WHEN channel_user_posts.user_id = $1 THEN true
    WHEN channel_user_posts.id IS NULL THEN true ELSE COALESCE(user_channels_feed.viewed, false) END,
    channel_user_posts.created_at DESC NULLS LAST;  `;
    const channels = await this.database.query<MyChannel>(query, [
      userId,
      organizationId,
    ]);
    return channels;
  }

  private prepareChannelUserPostAggregations(): string {
    const query = `
    SELECT channel_user_posts.*,JSON_AGG(ROW_TO_JSON(users.*)) AS users,
    COALESCE(JSON_AGG(DISTINCT post_images.*) FILTER (WHERE post_images.id IS NOT NULL),'[]') AS post_images,
    COALESCE(JSON_AGG(DISTINCT post_videos.*) FILTER (WHERE post_videos.id IS NOT NULL),'[]') AS post_videos,
    COALESCE(json_agg(channel_post_likes.*) FILTER (WHERE channel_post_likes.id IS NOT NULL),'[]') AS channel_post_likes,
    COALESCE(JSON_AGG(posts_hash_tags.*) FILTER (WHERE posts_hash_tags.id IS NOT NULL),'[]') AS posts_hash_tags,
    COALESCE(JSON_AGG(admin_posts_tools_we_loves.*) FILTER (WHERE admin_posts_tools_we_loves.id IS NOT NULL),'[]') AS admin_posts_tools_we_loves,
    COALESCE(JSON_AGG(admin_posts_tools_spotlights.*) FILTER (WHERE admin_posts_tools_spotlights.id IS NOT NULL),'[]') AS admin_posts_tools_spotlights,
    COALESCE(JSON_AGG(admin_posts_challenges.*) FILTER (WHERE admin_posts_challenges.id IS NOT NULL),'[]') AS admin_posts_challenges,

    COALESCE(JSON_AGG(DISTINCT poll_post_options.*) FILTER (WHERE poll_post_options.id IS NOT NULL),'[]') AS poll_options,
    COALESCE(json_agg( DISTINCT user_poll_post_options.*) FILTER (WHERE user_poll_post_options.id IS NOT NULL),'[]') AS user_poll_post_options,
    COALESCE(JSON_AGG( DISTINCT selected_poll_options.*) FILTER (WHERE selected_poll_options.id IS NOT NULL),'[]') AS selected_poll_options`;
    return query;
  }

  private prepareChannelUserPostAggragationJoins(): string {
    const query = `
    LEFT JOIN post_images ON post_images.post_id=channel_user_posts.id
LEFT JOIN post_videos ON post_videos.post_id=channel_user_posts.id
LEFT JOIN users ON users.id=channel_user_posts.user_id
LEFT JOIN (SELECT posts_hash_tags.post_id,hash_tags.* FROM posts_hash_tags JOIN hash_tags ON hash_tags.id=posts_hash_tags.hash_tag_id) posts_hash_tags ON posts_hash_tags.post_id=channel_user_posts.id
LEFT JOIN (
  SELECT admin_posts_tools_we_love.post_id,tool_kits.* FROM admin_posts_tools_we_love JOIN tool_kits ON admin_posts_tools_we_love.tool_kit_id=tool_kits.id
) admin_posts_tools_we_loves ON admin_posts_tools_we_loves.post_id=channel_user_posts.id
LEFT JOIN (
   SELECT admin_posts_tools_spotlight.post_id,tool_kits.* FROM admin_posts_tools_spotlight JOIN tool_kits ON admin_posts_tools_spotlight.tool_kit_id=tool_kits.id
) admin_posts_tools_spotlights ON admin_posts_tools_spotlights.post_id=channel_user_posts.id
LEFT JOIN(
  SELECT admin_posts_challenge.post_id,challenges.*,ROW_TO_JSON(tool_kits.*) AS tool_kit FROM admin_posts_challenge
  JOIN challenges ON admin_posts_challenge.challenge_id=challenges.id
  JOIN tool_kits ON tool_kits.id=challenges.tool_kit_id
) admin_posts_challenges ON admin_posts_challenges.post_id=channel_user_posts.id
LEFT JOIN channel_post_likes ON channel_post_likes.post_id=channel_user_posts.id AND channel_post_likes.user_id=$1

LEFT JOIN  poll_post_options ON poll_post_options.poll_post_id=channel_user_posts.id
LEFT JOIN  user_poll_post_options ON user_poll_post_options.poll_post_id=channel_user_posts.id
LEFT JOIN user_poll_post_options selected_poll_options ON selected_poll_options.poll_post_id=channel_user_posts.id AND selected_poll_options.user_id=$1
LEFT JOIN favourite_posts ON  favourite_posts.user_id=$1 AND favourite_posts.post_id=channel_user_posts.id
`;
    return query;
  }

  async getUserFeed(
    userId: string,
    organizationId: string,
    date: string,
    page: number,
    limit: number,
  ): Promise<{ posts: UserFeedPost[]; total: number }> {
    const offset = (page - 1) * limit;

    const commonQuery = `WHERE user_channels_feed.user_id=$1 AND channel_user_posts.is_post_disabled_by_admin=false AND channel_user_posts.is_post_disabled_by_user=false AND user_channels_feed.hide=false  AND (channel_user_posts.user_id NOT IN ( SELECT blocked_users.blocked_user_id FROM blocked_users WHERE blocked_users.blocked_by_user_id=$1 ) OR channel_user_posts.user_id IS NULL)
    `;
    const queryWithoutPagination = `SELECT CAST(COALESCE(COUNT(*),'0') AS INTEGER) AS total FROM user_channels_feed
    JOIN channel_user_posts ON channel_user_posts.id=user_channels_feed.post_id
    JOIN channels on channels.id=channel_user_posts.channel_id
    JOIN organisation_channels on organisation_channels.channel_id=channels.id
    ${commonQuery}
    AND organisation_channels.organisation_id=$2
    AND (channel_user_posts.post_render_date <=$3 OR channel_user_posts.post_render_date IS NOT NULL)
 
    `;
    const query = `
     ${this.prepareChannelUserPostAggregations()}
     FROM user_channels_feed
JOIN channel_user_posts ON channel_user_posts.id=user_channels_feed.post_id
LEFt JOIN channels on channels.id=channel_user_posts.channel_id
LEFT JOIN organisation_channels ON organisation_channels.channel_id=channels.id
${this.prepareChannelUserPostAggragationJoins()}
${commonQuery}
AND organisation_channels.organisation_id=$2
AND (channel_user_posts.post_render_date <=$3 OR channel_user_posts.post_render_date IS NOT NULL)
GROUP BY channel_user_posts.id
    ORDER BY channel_user_posts.created_at DESC
LIMIT $4 OFFSET $5
    `;
    const [[{ total }], posts] = await Promise.all([
      this.database.query<{ total: number }>(queryWithoutPagination, [
        userId,
        organizationId,
        date,
      ]),
      this.database.query<UserFeedPost>(query, [
        userId,
        organizationId,
        date,
        limit,
        offset,
      ]),
    ]);
    return { posts, total };
  }

  async getDefaultChannelPosts(
    userId: string,
    organizationId: string,
    date: string,
    page: number,
    limit: number,
  ): Promise<{ posts: UserFeedPost[]; total: number }> {
    const offset = (page - 1) * limit;

    const queryWithoutPagination = `SELECT CAST(COALESCE(COUNT(*),'0') AS INTEGER) AS total FROM channel_user_posts
    JOIN channels on channels.id=channel_user_posts.channel_id
JOIN organisation_channels on organisation_channels.channel_id=channels.id
    WHERE channel_user_posts.channel_id IN (SELECT channels.id FROM channels WHERE channels.default_channel=true) AND channel_user_posts.is_post_disabled_by_admin=false AND channel_user_posts.is_post_disabled_by_user=false AND (channel_user_posts.post_render_date <=$1 OR channel_user_posts.post_render_date IS NOT NULL)
    AND organisation_channels.organisation_id=$2
    AND channel_user_posts.user_id NOT IN (
        SELECT blocked_users.blocked_user_id
        FROM blocked_users
        WHERE blocked_users.blocked_by_user_id=$3
        )
    `;

    const query = `
     ${this.prepareChannelUserPostAggregations()}
     FROM channel_user_posts
${this.prepareChannelUserPostAggragationJoins()}
JOIN channels on channels.id=channel_user_posts.channel_id
JOIN organisation_channels on organisation_channels.channel_id=channels.id
    WHERE channel_user_posts.channel_id IN (SELECT channels.id FROM channels WHERE channels.default_channel=true) AND channel_user_posts.is_post_disabled_by_admin=false AND channel_user_posts.is_post_disabled_by_user=false AND (channel_user_posts.post_render_date <=$3 OR channel_user_posts.post_render_date IS NOT NULL)
    AND organisation_channels.organisation_id=$1
    AND channel_user_posts.user_id NOT IN (
        SELECT blocked_users.blocked_user_id
        FROM blocked_users
        WHERE blocked_users.blocked_by_user_id=$2
        )
    GROUP BY channel_user_posts.id
    ORDER BY channel_user_posts.created_at DESC
LIMIT $4 OFFSET $5
    `;
    const [[{ total }], posts] = await Promise.all([
      this.database.query<{ total: number }>(queryWithoutPagination, [
        date,
        organizationId,
        userId,
      ]),
      this.database.query<UserFeedPost>(query, [
        organizationId,
        userId,
        date,
        limit,
        offset,
      ]),
    ]);
    return { posts, total };
  }

  async getChannelFollowersUserIds(
    channelId: string,
    postId: string,
  ): Promise<string[]> {
    const query = `SELECT ARRAY(SELECT followers.user_id
      FROM (
          SELECT user_channels.user_id
          FROM user_channels
          WHERE user_channels.channel_id = $1 AND user_channels.is_channel_unfollowed = false
      ) AS followers
      LEFT JOIN user_channels_feed ON followers.user_id = user_channels_feed.user_id
       AND user_channels_feed.channel_id = $1 AND user_channels_feed.post_id = $2
      WHERE user_channels_feed.user_id IS NULL) as user_ids`;
    const [response] = await this.database.query<{
      user_ids: string[];
    }>(query, [channelId, postId]);
    return response.user_ids;
  }

  async getChannelWithTools(
    id: string,
    userId: string,
  ): Promise<ChannelWithTools> {
    const query = `SELECT channels.*,
    COALESCE(JSON_AGG(DISTINCT channel_tools.*) FILTER (WHERE channel_tools.id IS NOT NULL),'[]' ) AS channel_tools,
    COALESCE(JSON_AGG(user_channels.*) FILTER (WHERE user_channels.id IS NOT NULL),'[]' ) AS user_channels,
    COALESCE(COUNT(DISTINCT followers.id) FILTER (WHERE followers.id IS NOT NULL), 0) AS followers_count
    FROM channels
    LEFT JOIN (
    SELECT channel_tools.channel_id,channel_tools.channel_id AS channel_tool_id,tool_kits.* FROM channel_tools
    JOIN tool_kits ON tool_kits.id=channel_tools.tool_kit_id
    ORDER BY channel_tools.created_at
    )channel_tools ON channel_tools.channel_id=channels.id
    LEFT JOIN user_channels ON user_channels.channel_id=channels.id AND user_channels.user_id=$2
    LEFT JOIN user_channels AS followers ON followers.channel_id=channels.id AND followers.is_channel_unfollowed=false
    WHERE channels.id=$1
    GROUP BY channels.id`;
    const [channel] = await this.database.query<ChannelWithTools>(query, [
      id,
      userId,
    ]);
    return channel;
  }

  async getChannelPosts(
    params: GetChannelPostsParams,
  ): Promise<{ posts: UserFeedPost[]; total: number }> {
    const { page, limit, filters } = params;
    const offset = (page - 1) * limit;
    let commonQuery = `WHERE channel_user_posts.channel_id=$2 AND channel_user_posts.is_post_disabled_by_admin=false AND channel_user_posts.is_post_disabled_by_user=false AND (channel_user_posts.user_id NOT IN ( SELECT blocked_users.blocked_user_id FROM blocked_users WHERE blocked_users.blocked_by_user_id=$1 ) OR channel_user_posts.user_id IS NULL) AND (channel_user_posts.post_render_date <=$3 OR channel_user_posts.post_render_date IS NOT NULL)`;
    const subQuery = `
    SELECT channel_user_posts.id
    FROM channel_user_posts
    WHERE channel_user_posts.id IN (
        SELECT post_id
        FROM favourite_posts
        WHERE favourite_posts.user_id = $1
    )
`;
    if (filters) {
      const filterConditions: string[] = [];

      if (filters.show_own_posts) {
        filterConditions.push(`channel_user_posts.user_id = $1`);
      }
      if (filters.show_favourite_posts) {
        filterConditions.push(`channel_user_posts.id IN (${subQuery})`);
      }

      if (filterConditions.length > 0) {
        commonQuery += ` AND (${filterConditions.join(' OR ')})`;
      }
    }
    const queryWithoutPagination = `
      SELECT CAST(COALESCE(COUNT(*),'0') AS INTEGER) AS total FROM channel_user_posts
      ${commonQuery}`;

    const queryWithPagination = `
      ${this.prepareChannelUserPostAggregations()},
      CASE
      WHEN favourite_posts.id IS NOT NULL THEN true
                  ELSE false
                END AS is_favourite_post
      FROM channel_user_posts
      ${this.prepareChannelUserPostAggragationJoins()}
      ${commonQuery}
      GROUP BY channel_user_posts.id,favourite_posts.id
      ORDER BY channel_user_posts.created_at DESC
      LIMIT $4 OFFSET $5`;

    const [[{ total }], posts] = await Promise.all([
      this.database.query<{ total: number }>(queryWithoutPagination, [
        params.userId,
        params.id,
        params.date,
      ]),
      this.database.query<UserFeedPost>(queryWithPagination, [
        params.userId,
        params.id,
        params.date,
        params.limit,
        offset,
      ]),
    ]);

    return { posts, total };
  }

  async getLatestPostUserChannelFeed(
    userId: string,
    channelId: string,
  ): Promise<UserChannelFeed> {
    const query = `SELECT
    user_channels_feed.*
   FROM channels
       LEFT OUTER JOIN (
           SELECT
               channel_id,
               MAX(created_at) AS latest_post_created_at
           FROM
               channel_user_posts
           WHERE
               user_id NOT IN (
                   SELECT blocked_user_id FROM blocked_users WHERE blocked_by_user_id = $1
               ) AND channel_user_posts.id IN(
                 SELECT user_channels_feed.post_id FROM user_channels_feed WHERE user_channels_feed.user_id = $1
                 AND user_channels_feed.post_id = channel_user_posts.id
               )AND is_post_disabled_by_user = false AND is_post_disabled_by_admin = false
               AND( channel_user_posts.added_by = 'user'
                   OR( channel_user_posts.added_by = 'admin' AND channel_user_posts.post_render_date ::DATE = CURRENT_DATE )
               )
           GROUP BY
               channel_id
       ) AS latest_posts ON channels.id = latest_posts.channel_id
       LEFT JOIN channel_user_posts ON latest_posts.channel_id = channel_user_posts.channel_id AND latest_posts.latest_post_created_at = channel_user_posts.created_at
       LEFT JOIN user_channels_feed ON user_channels_feed.post_id = channel_user_posts.id AND user_channels_feed.user_id = $1
       JOIN user_channels ON user_channels.channel_id = channels.id
   WHERE
       user_channels.user_id = $1 AND user_channels.is_channel_unfollowed = false AND channels.id = $2
   ORDER BY channel_user_posts.created_at DESC NULLS LAST;`;
    const [userChannelFeed] = await this.database.query<UserChannelFeed>(
      query,
      [userId, channelId],
    );
    return userChannelFeed;
  }

  async updateUserChannelFeedAsViewed(
    userId: string,
    channelId: string,
  ): Promise<UserChannelFeed[]> {
    const query = `UPDATE user_channels_feed SET viewed = $3
    WHERE user_channels_feed.user_id = $1 AND user_channels_feed.channel_id = $2 RETURNING *`;
    const userChannelFeed = await this.database.query<UserChannelFeed>(query, [
      userId,
      channelId,
      true,
    ]);
    return userChannelFeed;
  }

  async hideUserChannelFeeds(
    userId: string,
    channelId: string,
  ): Promise<UserChannelFeed> {
    const query = `UPDATE user_channels_feed SET hide = $3
    WHERE user_channels_feed.user_id = $1 AND user_channels_feed.channel_id = $2  RETURNING *`;
    const [userChannelFeed] = await this.database.query<UserChannelFeed>(
      query,
      [userId, channelId, true],
    );
    return userChannelFeed;
  }

  private prepareChannelPostReactionAggragation(): string {
    const query = `
    SELECT channel_post_reactions.*,
       ROW_TO_JSON(users.*) AS users,
       COALESCE(JSON_AGG(DISTINCT channel_post_reactions_likes.*) FILTER (WHERE channel_post_reactions_likes.id IS NOT NULL),'[]') AS channel_post_reactions_likes,
       COALESCE((
           SELECT JSON_AGG(channel_post_reactions_conversations)
           FROM (
               SELECT channel_post_reactions_conversations.*, 
                      ROW_TO_JSON(users.*) AS users,
                      CASE
                      WHEN favourite_conversations.id IS NOT NULL 
                        THEN true
                        ELSE false
                      END AS is_favourite_conversation,
                      COALESCE(JSON_AGG(channel_post_reactions_conversations_likes.*) FILTER (WHERE channel_post_reactions_conversations_likes.id IS NOT NULL),'[]') AS channel_post_reactions_conversations_likes
               FROM channel_post_reactions_conversations
               LEFT JOIN users ON users.id = channel_post_reactions_conversations.user_id
               LEFT JOIN channel_post_reactions_conversations_likes ON channel_post_reactions_conversations_likes.conversation_id = channel_post_reactions_conversations.id
               AND channel_post_reactions_conversations_likes.user_id = $1
               LEFT JOIN favourite_conversations ON favourite_conversations.user_id = $1  AND  favourite_conversations.conversation_id = channel_post_reactions_conversations.id
               WHERE channel_post_reactions_conversations.reaction_id = channel_post_reactions.id
               AND channel_post_reactions_conversations.is_conversation_disabled_by_admin = false
               AND channel_post_reactions_conversations.is_conversation_disabled_by_user = false
               GROUP BY channel_post_reactions_conversations.id, users.id, favourite_conversations.id
               ORDER BY channel_post_reactions_conversations.created_at DESC
           ) AS channel_post_reactions_conversations
       ), '[]') AS channel_post_reactions_conversations
    `;
    return query;
  }

  private prepareChannelPostReactionAggragationJoins(): string {
    const query = `
    JOIN channel_post_reactions ON channel_post_reactions.post_id = channel_user_posts.id AND
    channel_post_reactions.is_reaction_disabled_by_admin = 'false' AND channel_post_reactions.is_reaction_disabled_by_user = 'false'
    LEFT JOIN users ON users.id = channel_post_reactions.user_id
    LEFT JOIN channel_post_reactions_likes ON channel_post_reactions_likes.reaction_id = channel_post_reactions.id
    AND channel_post_reactions_likes.user_id = $1
    LEFT JOIN favourite_reactions ON favourite_reactions.user_id = $1  AND  favourite_reactions.reaction_id = channel_post_reactions.id`;
    return query;
  }

  private prepareUserPostAggregations(): string {
    const query = `
    SELECT channel_user_posts.*,ROW_TO_JSON(users.*) AS users,
    CASE
    WHEN favourite_posts.id IS NOT NULL 
      THEN true
      ELSE false
    END AS is_favourite_post,
    COALESCE(JSON_AGG(post_images.*) FILTER (WHERE post_images.id IS NOT NULL),'[]') AS post_images,
    COALESCE(JSON_AGG(post_videos.*) FILTER (WHERE post_videos.id IS NOT NULL),'[]') AS post_videos,
    COALESCE(JSON_AGG(admin_post_reads.*) FILTER (WHERE admin_post_reads.id IS NOT NULL),'[]') AS admin_post_reads,
    COALESCE(json_agg(channel_post_likes.*) FILTER (WHERE channel_post_likes.id IS NOT NULL),'[]') AS channel_post_likes,
    COALESCE(JSON_AGG(posts_hash_tags.*) FILTER (WHERE posts_hash_tags.id IS NOT NULL),'[]') AS posts_hash_tags,
    COALESCE(JSON_AGG(admin_posts_tools_we_loves.*) FILTER (WHERE admin_posts_tools_we_loves.id IS NOT NULL),'[]') AS admin_posts_tools_we_loves,
    COALESCE(JSON_AGG(admin_posts_tools_spotlights.*) FILTER (WHERE admin_posts_tools_spotlights.id IS NOT NULL),'[]') AS admin_posts_tools_spotlights,
    COALESCE(JSON_AGG(admin_posts_challenges.*) FILTER (WHERE admin_posts_challenges.id IS NOT NULL),'[]') AS admin_posts_challenges
    `;
    return query;
  }

  private prepareUserPostAggragationJoins(): string {
    const query = `
    LEFT JOIN post_images ON post_images.post_id=channel_user_posts.id
    LEFT JOIN post_videos ON post_videos.post_id=channel_user_posts.id
    LEFT JOIN users ON users.id=channel_user_posts.user_id
    LEFT JOIN admin_post_reads ON admin_post_reads.admin_post_id=channel_user_posts.id AND admin_post_reads.user_id=$1
    LEFT JOIN (SELECT posts_hash_tags.post_id,hash_tags.* FROM posts_hash_tags JOIN hash_tags ON hash_tags.id=posts_hash_tags.hash_tag_id) posts_hash_tags ON posts_hash_tags.post_id=channel_user_posts.id
    LEFT JOIN (
    SELECT admin_posts_tools_we_love.post_id,tool_kits.* FROM admin_posts_tools_we_love JOIN tool_kits ON admin_posts_tools_we_love.tool_kit_id=tool_kits.id
    ) admin_posts_tools_we_loves ON admin_posts_tools_we_loves.post_id=channel_user_posts.id
    LEFT JOIN (
    SELECT admin_posts_tools_spotlight.post_id,tool_kits.* FROM admin_posts_tools_spotlight JOIN tool_kits ON admin_posts_tools_spotlight.tool_kit_id=tool_kits.id
    ) admin_posts_tools_spotlights ON admin_posts_tools_spotlights.post_id=channel_user_posts.id
    LEFT JOIN(
    SELECT admin_posts_challenge.post_id,challenges.*,ROW_TO_JSON(tool_kits.*) AS tool_kit FROM admin_posts_challenge
    JOIN challenges ON admin_posts_challenge.challenge_id=challenges.id
    JOIN tool_kits ON tool_kits.id=challenges.tool_kit_id
    ) admin_posts_challenges ON admin_posts_challenges.post_id=channel_user_posts.id
    LEFT JOIN channel_post_likes ON channel_post_likes.post_id=channel_user_posts.id AND channel_post_likes.user_id=$1
    LEFT JOIN favourite_posts ON favourite_posts.post_id=channel_user_posts.id AND favourite_posts.user_id=$1
   `;
    return query;
  }

  async getUserPost(userId: string, postId: string): Promise<UserPostDetail> {
    const query = `
    ${this.prepareUserPostAggregations()}
    FROM channel_user_posts
    ${this.prepareUserPostAggragationJoins()}
    WHERE
    channel_user_posts.id =$2
    AND channel_user_posts.is_post_disabled_by_admin = 'false'
    AND channel_user_posts.is_post_disabled_by_user = 'false'
    AND channel_user_posts.user_id NOT IN (
    SELECT blocked_users.blocked_user_id
    FROM blocked_users
    WHERE blocked_users.blocked_by_user_id = $1
    )
    GROUP BY channel_user_posts.id, users.id, favourite_posts.id`;
    const [userPost] = await this.database.query<UserPostDetail>(query, [
      userId,
      postId,
    ]);
    return userPost;
  }

  public async getPostById(postId: string): Promise<ChannelUserPost> {
    const query = `SELECT * FROM  channel_user_posts WHERE channel_user_posts.id = $1
    AND channel_user_posts.is_post_disabled_by_user='false' AND channel_user_posts.is_post_disabled_by_admin='false'`;
    const [userPost] = await this.database.query<ChannelUserPost>(query, [
      postId,
    ]);
    return userPost;
  }

  public async getPostReactionById(
    reactionId: string,
  ): Promise<ChannelPostReactions> {
    const query = `SELECT * FROM  channel_post_reactions WHERE channel_post_reactions.id = $1
    AND channel_post_reactions.is_reaction_disabled_by_user='false' AND channel_post_reactions.is_reaction_disabled_by_admin='false'`;
    const [postReaction] = await this.database.query<ChannelPostReactions>(
      query,
      [reactionId],
    );
    return postReaction;
  }

  public async getConversationById(
    conversationId: string,
  ): Promise<ChannelPostConversation> {
    const query = `SELECT * FROM  channel_post_reactions_conversations WHERE channel_post_reactions_conversations.id = $1
    AND channel_post_reactions_conversations.is_conversation_disabled_by_user='false' AND channel_post_reactions_conversations.is_conversation_disabled_by_admin='false'`;
    const [reactionCoversation] =
      await this.database.query<ChannelPostConversation>(query, [
        conversationId,
      ]);
    return reactionCoversation;
  }

  async getPostReaction(
    userId: string,
    postId: string,
    page: number,
    limit: number,
  ): Promise<{ postReactions: PostReactionDetail[]; total: number }> {
    const offset = (page - 1) * limit;
    const queryWithoutPagination = `SELECT CAST(COALESCE(COUNT(channel_post_reactions.id), 0) AS INTEGER) AS total
    FROM channel_user_posts
    LEFT JOIN channel_post_reactions ON channel_post_reactions.post_id = channel_user_posts.id
    AND channel_post_reactions.is_reaction_disabled_by_admin = 'false'
    AND channel_post_reactions.is_reaction_disabled_by_user = 'false'
    WHERE channel_user_posts.id = $2
    AND channel_user_posts.is_post_disabled_by_admin = 'false'
    AND channel_user_posts.is_post_disabled_by_user = 'false'
    AND channel_user_posts.user_id NOT IN (
        SELECT blocked_users.blocked_user_id
        FROM blocked_users
        WHERE blocked_users.blocked_by_user_id = $1
    )
    `;

    const query = `
    ${this.prepareChannelPostReactionAggragation()},
        CASE
        WHEN favourite_reactions.id IS NOT NULL THEN true
       ELSE false
   END AS is_favourite_post_reaction
    FROM channel_user_posts
    ${this.prepareChannelPostReactionAggragationJoins()}
    WHERE
    channel_user_posts.id =$2
    AND channel_user_posts.is_post_disabled_by_admin = 'false'
    AND channel_user_posts.is_post_disabled_by_user = 'false'
    AND channel_user_posts.user_id NOT IN (
    SELECT blocked_users.blocked_user_id
    FROM blocked_users
    WHERE blocked_users.blocked_by_user_id = $1
    )
    GROUP BY channel_post_reactions.id, users.id,favourite_reactions.id
    ORDER BY channel_post_reactions.created_at DESC
    LIMIT $3 OFFSET $4
     `;
    const [[{ total }], postReactions] = await Promise.all([
      this.database.query<{ total: number }>(queryWithoutPagination, [
        userId,
        postId,
      ]),
      this.database.query<PostReactionDetail>(query, [
        userId,
        postId,
        limit,
        offset,
      ]),
    ]);
    return { postReactions, total };
  }

  async getReactionConversations(
    userId: string,
    reactionId: string,
    page: number,
    limit: number,
  ): Promise<{
    reactionConversations: ReactionWithConversations;
    total: number;
  }> {
    const offset = (page - 1) * limit;
    const queryWithoutPagination = `SELECT CAST(COALESCE(COUNT(channel_post_reactions_conversations.id), 0) AS INTEGER) AS total
    FROM channel_post_reactions
    LEFT JOIN channel_post_reactions_conversations ON channel_post_reactions_conversations.reaction_id = channel_post_reactions.id
    AND channel_post_reactions_conversations.is_conversation_disabled_by_admin = 'false'
    AND channel_post_reactions_conversations.is_conversation_disabled_by_user = 'false'
    AND channel_post_reactions_conversations.user_id NOT IN (
    SELECT blocked_users.blocked_user_id
    FROM blocked_users
    WHERE blocked_users.blocked_by_user_id = $1
    )
    WHERE channel_post_reactions.id = $2
    AND channel_post_reactions.is_reaction_disabled_by_admin = 'false'
    AND channel_post_reactions.is_reaction_disabled_by_user = 'false'
    `;

    const query = `
    SELECT channel_post_reactions.*,
       ROW_TO_JSON(users.*) AS users,
       CASE
          WHEN favourite_reactions.id IS NOT NULL THEN true
          ELSE false
       END AS is_favourite_post_reaction,
       COALESCE(JSON_AGG(DISTINCT channel_post_reactions_likes.*) FILTER (WHERE channel_post_reactions_likes.id IS NOT NULL),'[]') AS channel_post_reactions_likes,
       COALESCE(
           (
               SELECT JSON_AGG(conversations)
               FROM (
                   SELECT channel_post_reactions_conversations.*,
                          ROW_TO_JSON(users.*) AS users,
                          CASE
                            WHEN favourite_conversations.id IS NOT NULL THEN true
                            ELSE false
                          END AS is_favourite_conversation,
                          COALESCE(JSON_AGG(DISTINCT channel_post_reactions_conversations_likes.*) FILTER (WHERE channel_post_reactions_conversations_likes.id IS NOT NULL),'[]') AS channel_post_reactions_conversations_likes
                   FROM channel_post_reactions_conversations
                   JOIN users ON users.id = channel_post_reactions_conversations.user_id
                   LEFT JOIN channel_post_reactions_conversations_likes ON channel_post_reactions_conversations_likes.conversation_id=channel_post_reactions_conversations.id
                   AND channel_post_reactions_conversations_likes.user_id = $1
                   LEFT JOIN favourite_conversations ON favourite_conversations.user_id = $1  AND  favourite_conversations.conversation_id = channel_post_reactions_conversations.id
                   WHERE channel_post_reactions_conversations.reaction_id = $2
                          AND channel_post_reactions_conversations.is_conversation_disabled_by_admin = false
                          AND channel_post_reactions_conversations.is_conversation_disabled_by_user = false
                          AND channel_post_reactions_conversations.user_id NOT IN (
                              SELECT blocked_users.blocked_user_id
                              FROM blocked_users
                              WHERE blocked_users.blocked_by_user_id = $1
                          )
                   GROUP BY channel_post_reactions_conversations.id, users.id, favourite_conversations.id
                   ORDER BY channel_post_reactions_conversations.created_at DESC
                   LIMIT $3 OFFSET $4
               ) AS conversations
           ),
           '[]'
       ) AS channel_post_reactions_conversations
      
    FROM channel_post_reactions
    LEFT JOIN users ON users.id = channel_post_reactions.user_id
    LEFT JOIN channel_post_reactions_likes ON channel_post_reactions_likes.reaction_id = channel_post_reactions.id
    AND channel_post_reactions_likes.user_id = $1
    LEFT JOIN favourite_reactions ON favourite_reactions.user_id = $1  AND  favourite_reactions.reaction_id = channel_post_reactions.id
    WHERE channel_post_reactions.id = $2
    AND channel_post_reactions.is_reaction_disabled_by_admin = 'false'
    AND channel_post_reactions.is_reaction_disabled_by_user = 'false'
    GROUP BY channel_post_reactions.id, users.id, favourite_reactions.id;
    `;
    const [[{ total }], [reactionConversations]] = await Promise.all([
      this.database.query<{ total: number }>(queryWithoutPagination, [
        userId,
        reactionId,
      ]),
      this.database.query<ReactionWithConversations>(query, [
        userId,
        reactionId,
        limit,
        offset,
      ]),
    ]);
    return { reactionConversations, total };
  }

  async searchPosts(
    userId: string,
    date: string,
    text: string,
    page: number,
    limit: number,
  ): Promise<{ posts: UserFeedPost[]; total: number }> {
    const offset = (page - 1) * limit;

    const queryWithoutPagination = `SELECT CAST(COALESCE(COUNT(*),'0') AS INTEGER) AS total FROM channel_user_posts
    WHERE channel_user_posts.channel_id IN
    ((SELECT channels.id FROM channels WHERE channels.default_channel=true) UNION ALL (SELECT user_channels.channel_id AS id FROM user_channels WHERE user_channels.user_id=$2 AND user_channels.is_channel_unfollowed=false))
    AND to_tsvector('english', channel_user_posts.message) @@ plainto_tsquery('english', $3)
    AND channel_user_posts.is_post_disabled_by_admin=false AND channel_user_posts.is_post_disabled_by_user=false AND (channel_user_posts.post_render_date <=$1 OR channel_user_posts.post_render_date IS NOT NULL)
    AND channel_user_posts.user_id NOT IN (
        SELECT blocked_users.blocked_user_id
        FROM blocked_users
        WHERE blocked_users.blocked_by_user_id = $2
        )
    `;

    const query = `
     ${this.prepareChannelUserPostAggregations()}
     FROM channel_user_posts
${this.prepareChannelUserPostAggragationJoins()}
    WHERE channel_user_posts.channel_id IN
    ((SELECT channels.id FROM channels WHERE channels.default_channel=true) UNION ALL (SELECT user_channels.channel_id AS id FROM user_channels WHERE user_channels.user_id=$1 AND user_channels.is_channel_unfollowed=false ))
    AND to_tsvector('english', channel_user_posts.message) @@ plainto_tsquery('english', $5)
    AND channel_user_posts.is_post_disabled_by_admin=false AND channel_user_posts.is_post_disabled_by_user=false AND (channel_user_posts.post_render_date <=$2 OR channel_user_posts.post_render_date IS NOT NULL)
    AND channel_user_posts.user_id NOT IN (
        SELECT blocked_users.blocked_user_id
        FROM blocked_users
        WHERE blocked_users.blocked_by_user_id=$1
        )
    GROUP BY channel_user_posts.id
    ORDER BY channel_user_posts.created_at DESC
LIMIT $3 OFFSET $4
    `;
    const [[{ total }], posts] = await Promise.all([
      this.database.query<{ total: number }>(queryWithoutPagination, [
        date,
        userId,
        text,
      ]),
      this.database.query<UserFeedPost>(query, [
        userId,
        date,
        limit,
        offset,
        text,
      ]),
    ]);
    return { posts, total };
  }

  async getFavouritePosts(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ posts: UserFeedPost[]; total: number }> {
    const offset = (page - 1) * limit;

    const queryWithoutPagination = `SELECT CAST(COALESCE(COUNT(*),'0') AS INTEGER) AS total FROM channel_user_posts
    WHERE channel_user_posts.is_post_disabled_by_admin=false AND channel_user_posts.is_post_disabled_by_user=false AND
    channel_user_posts.user_id NOT IN (SELECT blocked_users.blocked_user_id FROM blocked_users WHERE blocked_users.blocked_by_user_id = $1 )
    AND (channel_user_posts.id IN (SELECT favourite_posts.post_id FROM favourite_posts WHERE favourite_posts.user_id =$1)
    OR channel_user_posts.id IN (SELECT favourite_reactions.post_id FROM favourite_reactions WHERE favourite_reactions.user_id = $1)
    OR channel_user_posts.id IN (SELECT favourite_conversations.post_id FROM favourite_conversations WHERE favourite_conversations.user_id =$1))
    `;

    const queryWithPagination = `
    ${this.prepareChannelUserPostAggregations()}
    FROM channel_user_posts
    ${this.prepareChannelUserPostAggragationJoins()}
    WHERE channel_user_posts.is_post_disabled_by_admin=false AND channel_user_posts.is_post_disabled_by_user=false AND
    channel_user_posts.user_id NOT IN (SELECT blocked_users.blocked_user_id FROM blocked_users WHERE blocked_users.blocked_by_user_id = $1 )
    AND (channel_user_posts.id IN (SELECT favourite_posts.post_id FROM favourite_posts WHERE favourite_posts.user_id =$1)
    OR channel_user_posts.id IN (SELECT favourite_reactions.post_id FROM favourite_reactions WHERE favourite_reactions.user_id = $1)
    OR channel_user_posts.id IN (SELECT favourite_conversations.post_id FROM favourite_conversations WHERE favourite_conversations.user_id =$1))
    GROUP BY channel_user_posts.id
    ORDER BY channel_user_posts.created_at DESC
    LIMIT $2 OFFSET $3
    `;
    const [[{ total }], posts] = await Promise.all([
      this.database.query<{ total: number }>(queryWithoutPagination, [userId]),
      this.database.query<UserFeedPost>(queryWithPagination, [
        userId,
        limit,
        offset,
      ]),
    ]);
    return { posts, total };
  }

  public async getDefaultChannel(): Promise<Channel> {
    const query = `SELECT * FROM channels WHERE default_channel = true ORDER BY updated_at DESC LIMIT 1 ;`;
    const [data] = await this.database.query<Channel>(query);
    return data;
  }

  async saveUserPollPostOption(
    data: Omit<UserPollPostOption, 'created_at' | 'updated_at' | 'id'>,
  ): Promise<UserPollPostOption> {
    const query = `INSERT INTO user_poll_post_options (${Object.keys(data).join(
      ',',
    )}) VALUES (${Object.keys(data)
      .map((_, index) => `$${index + 1}`)
      .join(
        ',',
      )}) ON CONFLICT (user_id,poll_post_id) DO UPDATE SET ${Object.keys(data)
      .map((col, index) => `${col}=$${index + 1}`)
      .join(',')} RETURNING *`;
    const [userPollPostOption] = await this.database.query<UserPollPostOption>(
      query,
      Object.values(data),
    );
    return userPollPostOption;
  }
  public async getLikesCount(
    id: string,
    tableName: string,
    fieldName: string,
  ): Promise<number> {
    const query = `SELECT COALESCE(COUNT(*), 0) AS count FROM ${tableName}
    WHERE ${fieldName}  = $1`;
    const [count] = await this.database.query<{ count: number }>(query, [id]);
    return count.count;
  }

  async getLikes(
    id: string,
    tableName: string,
  ): Promise<ChannelUserPost | ChannelPostReactions | ChannelPostConversation> {
    const query = `SELECT * FROM ${tableName} WHERE id = $1`;
    const [updateUserPost] = await this.database.query<
      ChannelUserPost | ChannelPostReaction | ChannelPostConversation
    >(query, [id]);
    return updateUserPost;
  }

  public async getReactionsCount(
    body: UpdateReactionCountDto,
  ): Promise<number> {
    const { id, reactionType } = body;
    const tableName = reactionTableName.get(reactionType);
    const fieldName = reactionTableFieldName.get(reactionType);

    const query = `SELECT COALESCE(COUNT(*), 0) AS count FROM ${tableName}
    WHERE ${fieldName} = $1 ${
      reactionType === ReactionType.POST_REACTION
        ? ` AND is_reaction_disabled_by_user = $2 AND is_reaction_disabled_by_admin = $2`
        : reactionType === ReactionType.POST_REACTION_CONVERSATION
        ? ` AND is_conversation_disabled_by_user = $2 AND is_conversation_disabled_by_admin = $2`
        : ` `
    }`;

    const [count] = await this.database.query<{ count: number }>(query, [
      id,
      false,
    ]);
    return count.count;
  }

  async updateReactionCount(
    genericId: string,
    reactionType: ReactionType,
    totalReactions: number,
  ): Promise<ChannelUserPost | ChannelPostReactions> {
    const tableName = reactionUpdateTableName.get(reactionType);
    const query = `UPDATE ${tableName} SET total_reactions= $1 WHERE id = $2 RETURNING *`;
    const [updatedUserPostOrPostReaction] = await this.database.query<
      ChannelUserPost | ChannelPostReaction
    >(query, [totalReactions, genericId]);
    return updatedUserPostOrPostReaction;
  }

  /**
   *
   * @description Used to get the data from the table where we going to update the count
   *
   */
  async getUserPostOrPostReaction(
    body: UpdateReactionCountDto,
  ): Promise<ChannelUserPost | ChannelPostReactions> {
    const { id, reactionType } = body;
    const tableName = reactionUpdateTableName.get(reactionType);

    const query = `SELECT * FROM ${tableName} WHERE id = $1 ${
      reactionType === ReactionType.POST_REACTION
        ? `AND is_post_disabled_by_admin = $2 AND is_post_disabled_by_user = $2`
        : reactionType === ReactionType.POST_REACTION_CONVERSATION
        ? `AND is_reaction_disabled_by_admin = $2 AND is_reaction_disabled_by_user = $2`
        : ` `
    }`;

    const [UserPostOrPostReaction] = await this.database.query<
      ChannelUserPost | ChannelPostReaction
    >(query, [id, false]);
    return UserPostOrPostReaction;
  }

  async getPrivateChannels(
    userId: string,
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ channels: PrivateChannelsData[]; total: number }> {
    const offset = (page - 1) * limit;
    const params: unknown[] = [userId, true, false];

    let commonQuery = `FROM user_channels
        LEFT JOIN channels ON user_channels.channel_id = channels.id
    WHERE user_channels.user_id = $1 
      AND channels.is_private= $2 
      AND channels.is_deleted= $3 
      AND user_channels.is_channel_unfollowed= $3 `;

    const queryWithoutPagination = `SELECT CAST(COALESCE(COUNT(*),'0') AS INTEGER) AS total ${commonQuery} `;

    const query = `SELECT channels.id,channels.title,channels.description,channels.image_id,channels.image_url,
    channels.image_file_path ${commonQuery} ${
      search
        ? ` ORDER BY user_channels.created_at DESC LIMIT $5 OFFSET $6`
        : `ORDER BY user_channels.created_at DESC LIMIT $4 OFFSET $5`
    }`;

    const searchQuery = `AND (title ILIKE $4 )`;

    if (search) {
      params.push(`%${search}%`);
      commonQuery += searchQuery;
    }
    const [[{ total }], channels] = await Promise.all([
      this.database.query<{ total: number }>(queryWithoutPagination, params),
      this.database.query<PrivateChannelsData>(query, [
        ...params,
        limit,
        offset,
      ]),
    ]);
    return { channels, total };
  }

  async getOrganisationChannels(
    organisationId: string,
    search?: string,
  ): Promise<Channel[]> {
    let query = `SELECT
    channels.*,
    (
      SELECT
        CAST(COALESCE(COUNT(user_channels.*), '0') AS INTEGER)
      FROM
        user_channels
        RIGHT JOIN users ON users.id = user_channels.user_id
      WHERE
        user_channels.channel_id = channels.id
        AND organisation_channels.organisation_id = users.organization_id
        AND user_channels.is_channel_unfollowed = $2
        AND channels.is_deleted = $2
    ) AS total_followers
  FROM
    channels
    LEFT JOIN organisation_channels ON organisation_channels.channel_id = channels.id
  WHERE
    organisation_channels.organisation_id = $1
    AND channels.is_deleted= $2
   `;

    const searchQuery = ` AND (
    CASE
      WHEN jsonb_exists(channels.translations, 'en') AND  (channels.translations -> 'en' ->> 'title') ILIKE '%${search}%' THEN true
      WHEN jsonb_exists(channels.translations, 'nl') AND  (channels.translations -> 'nl' ->> 'title') ILIKE '%${search}%' THEN true
      ELSE channels.title ILIKE '%${search}%'
    END
  );`;
    if (search) {
      query += searchQuery;
    }

    const channel = await this.database.query<Channel>(query, [
      organisationId,
      false,
    ]);
    return channel;
  }

  async getChannelUserList(
    channelId: string,
    page: number,
    limit: number,
  ): Promise<{ users: UsersData[]; total: number }> {
    const offset = (page - 1) * limit;
    const query = `
    SELECT users.* 
    FROM users
    JOIN user_channels ON users.id = user_channels.user_id
    WHERE user_channels.channel_id = $1 
    AND user_channels.is_channel_unfollowed = $2
    AND user_channels.organisation_id = users.organization_id
    LIMIT $3 OFFSET $4`;
    const queryWithoutPagination = `
      SELECT COUNT(*) AS total
      FROM user_channels
      WHERE channel_id = $1 AND is_channel_unfollowed = $2::boolean`;
    const params: unknown[] = [channelId, false, limit, offset];
    const [[{ total }], users] = await Promise.all([
      this.database.query<{ total: number }>(queryWithoutPagination, [
        channelId,
        false,
      ]),
      this.database.query<UsersData>(query, params),
    ]);
    return { users, total };
  }

  async getUserInChannel(
    userId: string,
    channelId: string,
  ): Promise<UserChannel> {
    const query = `
      SELECT *
      FROM user_channels
      WHERE user_id = $1 AND channel_id = $2`;
    const [result] = await this.database.query<UserChannel>(query, [
      userId,
      channelId,
    ]);
    return result;
  }

  public async getChannelUserPost(
    userId: string,
    postId: string,
  ): Promise<ChannelUserPost> {
    const query = `SELECT * FROM  channel_user_posts WHERE channel_user_posts.user_id = $1 AND channel_user_posts.id = $2`;
    const [userPost] = await this.database.query<ChannelUserPost>(query, [
      userId,
      postId,
    ]);
    return userPost;
  }
}
