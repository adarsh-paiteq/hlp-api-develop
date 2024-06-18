import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  ChannelInfo,
  ChannelPostLikeInfo,
  ChannelPostReactionConverationInfo,
  ChannelPostReactionLikeInfo,
  OperationTypes,
  PayloadType,
  UpdatePostPayload,
} from './community.dto';
import { CommunityRepo } from './community.repo';

@Injectable()
export class CommunityService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly communityRepo: CommunityRepo,
  ) {}
  private readonly logger = new Logger(CommunityService.name);

  /**
   * @deprecated it's not been used anywhere
   * updates total followers count of a channel
   */
  async updateChannelFollower(data: any, operationType: string) {
    const channelDeails = await this.communityRepo.getChannelDetails(
      data.new.channel_id,
    );
    if (operationType == OperationTypes.INSERT) {
      if (!channelDeails.total_followers) {
        channelDeails.total_followers = 0;
      }
      channelDeails.total_followers += 1;
    } else {
      const old_data: ChannelInfo = data.old;
      const new_data: ChannelInfo = data.new;
      if (old_data.is_channel_unfollowed !== new_data.is_channel_unfollowed) {
        if (!new_data.is_channel_unfollowed) {
          channelDeails.total_followers += 1;
        } else {
          channelDeails.total_followers -= 1;
        }
      }
    }
    return this.communityRepo.updateChannelFollowers(
      channelDeails.total_followers,
      channelDeails.id,
    );
  }

  /**
   * @deprecated It's used in @function updateChannelPostLikesCount() controller function
   * which is used by channel_post_likes hasura event trigger
   * updates total likes of a channel post
   */
  public async updateTotaLikesOfChannelPost(
    postInfo: ChannelPostLikeInfo,
    operationType: string,
  ) {
    const postDetails = await this.communityRepo.getChannelPostInfo(
      postInfo.post_id,
    );
    if (operationType == OperationTypes.INSERT) {
      if (!postDetails.total_likes) {
        postDetails.total_likes = 0;
      }
      postDetails.total_likes += 1;
    } else {
      postDetails.total_likes -= 1;
    }
    return this.communityRepo.updateChannelPostLikes(
      postDetails.total_likes,
      postDetails.id,
    );
  }

  /**
   * @deprecated This method is used in the 'updateChannelPostCount' controller function,
   * which is triggered by the 'channel_post_reactions' Hasura event.
   * It updates the total reactions of a channel post.
   * Please note that this method is deprecated and should not be used in new code.
   */
  // public async updateTotaReactionsOfChannelPost(
  //   data: any,
  //   operationType: string,
  // )
  // {
  //   const postDetails = await this.communityRepo.getChannelPostInfo(
  //     data.new.post_id,
  //   );
  //   if (operationType == OperationTypes.INSERT) {
  //     if (!postDetails.total_reactions) {
  //       postDetails.total_reactions = 0;
  //     }
  //     postDetails.total_reactions += 1;
  //   } else {
  //     const oldData: ChannelPostLikeInfo = data.old;
  //     const newData: ChannelPostLikeInfo = data.new;
  //     if (
  //       oldData.is_reaction_disabled_by_user !=
  //       newData.is_reaction_disabled_by_user
  //     ) {
  //       postDetails.total_reactions -= 1;
  //     }
  //   }
  //   return this.communityRepo.updateChannelPostReactionsCount(
  //     postDetails.total_reactions,
  //     postDetails.id,
  //   );
  // }

  /**
   * @deprecated It's used in @function updateChannelPostReactionsLikesCount() controller function
   * which is used by channel_post_reactions_likes hasura event trigger
   * updates total likes of a channel post reaction
   */
  public async updateTotaLikesOfChannelPostReaction(
    reactionInfo: ChannelPostReactionLikeInfo,
    operationType: string,
  ) {
    const reactionDetails = await this.communityRepo.getChannelPostReactionInfo(
      reactionInfo.reaction_id,
    );
    if (operationType == OperationTypes.INSERT) {
      if (!reactionDetails.total_likes) {
        reactionDetails.total_likes = 0;
      }
      reactionDetails.total_likes += 1;
    } else {
      reactionDetails.total_likes -= 1;
    }
    return this.communityRepo.updateChannelPostReactionLikesCount(
      reactionDetails.total_likes,
      reactionDetails.id,
    );
  }

  /**
   * @deprecated It's used in @function updateChannelPostReactionCommentCount() controller function
   * which is used by channel_post_reactions_conversations hasura event trigger
   * updates total reactions of a channel post reaction
   */
  public async updateTotaReactionsOfChannelPostReaction(
    data: any,
    operationType: string,
  ) {
    const reactionDetails = await this.communityRepo.getChannelPostReactionInfo(
      data.new.reaction_id,
    );
    if (operationType == OperationTypes.INSERT) {
      if (!reactionDetails.total_reactions) {
        reactionDetails.total_reactions = 0;
      }
      reactionDetails.total_reactions += 1;
    } else {
      const oldData: ChannelPostReactionLikeInfo = data.old;
      const newData: ChannelPostReactionLikeInfo = data.new;
      if (
        oldData.is_conversation_disabled_by_user !=
        newData.is_conversation_disabled_by_user
      ) {
        reactionDetails.total_reactions -= 1;
      }
    }
    return this.communityRepo.updateChannelPostReactionCommentCount(
      reactionDetails.total_reactions,
      reactionDetails.id,
    );
  }

  /**
   * @deprecated It's used in @function updateChannelPostReactionsCommentLikesCount() controller function
   * which is used by channel_post_reactions_conversations_likes hasura event trigger
   * updates total likes of a channel post reaction
   */
  public async updateTotaLikesOfChannelPostReactionComment(
    reactionCommentInfo: ChannelPostReactionConverationInfo,
    operationType: string,
  ) {
    const reactionDetails =
      await this.communityRepo.getChannelPostReactionCommentInfo(
        reactionCommentInfo.conversation_id,
      );
    if (operationType == OperationTypes.INSERT) {
      if (!reactionDetails.total_likes) {
        reactionDetails.total_likes = 0;
      }
      reactionDetails.total_likes += 1;
    } else {
      reactionDetails.total_likes -= 1;
    }
    return this.communityRepo.updateChannelPostReactionCommentLikesCount(
      reactionDetails.total_likes,
      reactionDetails.id,
    );
  }

  /**
   * @deprecated It is used in @function updatePostImagesAndVideo() function which is not been used
   */
  async postImagesAndVideoUpdate(
    userId: string,
    postId: string,
    payload: UpdatePostPayload,
  ): Promise<string | string[] | undefined> {
    const res = await this.updateImageAndVideoOfPost(userId, postId, payload);
    const status = await this.communityRepo.getPostImagesAndVideos(
      userId,
      postId,
    );
    this.logger.log(status, 'Post-update');
    return res;
  }
  /**
   * @deprecated It is used in @function postImagesAndVideoUpdate() function which is not been used
   */
  private async updateImageAndVideoOfPost(
    userId: string,
    postId: string,
    payload: UpdatePostPayload,
  ): Promise<string | string[] | undefined> {
    const { operation, type, images, image_ids, video, video_id } = payload;
    const res = await this.communityRepo.getPostImagesAndVideos(userId, postId);
    const { no_of_images, no_of_videos } = res;
    //User Post contains only message
    if (no_of_images === 0 && no_of_videos === 0) {
      // if user likes to insert video
      if (
        operation === OperationTypes.INSERT &&
        type === PayloadType.VIDEO &&
        video
      ) {
        const uploadedVideo = await this.communityRepo.insertVideo(
          userId,
          postId,
          video,
        );
        return uploadedVideo;
      }
      // if user likes to insert one or many images
      if (
        operation === OperationTypes.INSERT &&
        type === PayloadType.IMAGE &&
        images
      ) {
        const uploadedImages =
          await this.communityRepo.insertOneOrMultipleImage(
            userId,
            postId,
            images,
          );
        return uploadedImages;
      }
    }
    //User Post contains image
    if (no_of_images > 0) {
      // if user likes to delete all images
      if (
        operation === OperationTypes.DELETE &&
        type === PayloadType.IMAGE &&
        !image_ids
      ) {
        const deletedImages = await this.communityRepo.deleteAllImages(
          userId,
          postId,
        );
        return deletedImages;
      }
      // if user likes to delete one image at a time
      if (
        operation === OperationTypes.DELETE &&
        type === PayloadType.IMAGE &&
        image_ids
      ) {
        const deletedImage = await this.communityRepo.deleteOneImage(
          image_ids[0],
        );
        return deletedImage;
      }
      // if user likes to insert video
      if (
        operation === OperationTypes.INSERT &&
        type === PayloadType.VIDEO &&
        video &&
        no_of_videos === 0
      ) {
        const uploadedVideo = await this.communityRepo.insertVideo(
          userId,
          postId,
          video,
        );
        return uploadedVideo;
      }
      // if user likes to insert one or many images
      if (
        operation === OperationTypes.INSERT &&
        type === PayloadType.IMAGE &&
        images &&
        no_of_videos === 0
      ) {
        const uploadedImages =
          await this.communityRepo.insertOneOrMultipleImage(
            userId,
            postId,
            images,
          );
        return uploadedImages;
      }
    }
    //User Post contains video
    if (no_of_videos === 1) {
      // if user likes to delete video
      if (operation === OperationTypes.DELETE && type === PayloadType.VIDEO) {
        const deletedVideo = await this.communityRepo.deleteVideo(
          userId,
          postId,
        );
        return deletedVideo;
      }
      // if user likes to update video
      if (
        operation === OperationTypes.UPDATE &&
        type === PayloadType.VIDEO &&
        video_id &&
        video
      ) {
        const updatedVideo = await this.communityRepo.updateVideo(
          userId,
          postId,
          video_id,
          video,
        );
        return updatedVideo;
      }
    }
  }
}
