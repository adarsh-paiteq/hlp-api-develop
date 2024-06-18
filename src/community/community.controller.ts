import { Body, Controller, Param, Post } from '@nestjs/common';
import { LoggedInUser } from '../shared/auth/jwt.strategy';
import { OperationTypes, UpdatePostPayload } from './community.dto';
import { CommunityService } from './community.service';
import { GetUser } from '../shared/decorators/user.decorator';

@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  /**
   * @deprecated Unused controller
   * it's migrated to updatePostImagesAndVideo Resolver
   * And from app side thay are using migrated updatePostImagesAndVideo Resolver
   */
  @Post('/post/:id/update')
  async updatePostImagesAndVideo(
    @GetUser() user: LoggedInUser,
    @Param('id') id: string,
    @Body() body: UpdatePostPayload,
  ): Promise<string | string[] | undefined> {
    const res = await this.communityService.postImagesAndVideoUpdate(
      user.id,
      id,
      body,
    );
    return res;
  }
  // @Post('/channel-follow-unfollow')
  // async updateChannelFollowersCount(@Body() body: any) {
  //   const operationType: string = body.event.op;
  //   const {
  //     event: { data },
  //   } = body;
  //   return this.communityService.updateChannelFollower(data, operationType);
  // }

  /**
   * @deprecated Triggered from channel_post_likes Hasura Event Trigger
   * It's migrated in updatelikeChannelPost Resolver but app team  using this migration
   * Found duplication Event in Channels module ( channel_post_like Event which is to send Liked Notification only)
   */
  @Post('/channel-post-likes')
  async updateChannelPostLikesCount(@Body() body: any) {
    const operationType: string = body.event.op;
    const {
      event: { data },
    } = body;
    return this.communityService.updateTotaLikesOfChannelPost(
      operationType == OperationTypes.INSERT ? data.new : data.old,
      operationType,
    );
  }

  /**
   * @deprecated This method is triggered from the 'channel_post_reactions' Hasura Event Trigger.
   * The functionality has been migrated to CHANNEL_POST_REACTION_ADDED event.
   * Both the app team and CMS team are utilizing this migration.
   */
  // @Post('/channel-post-reactions')
  // async updateChannelPostCount(@Body() body: any) {
  //   const operationType: string = body.event.op;
  //   const {
  //     event: { data },
  //   } = body;
  //   return this.communityService.updateTotaReactionsOfChannelPost(
  //     data,
  //     operationType,
  //   );
  // }

  /**
   * @deprecated Triggered from channel_post_reactions_likes Hasure Event Trigger
   * It's migrated in updatelikeChannelPostReaction Resolver but app team isusing this migration
   */
  @Post('/channel-post-reactions-likes')
  async updateChannelPostReactionsLikesCount(@Body() body: any) {
    const operationType: string = body.event.op;
    const {
      event: { data },
    } = body;
    return this.communityService.updateTotaLikesOfChannelPostReaction(
      operationType == OperationTypes.INSERT ? data.new : data.old,
      operationType,
    );
  }

  /**
   * @description Triggered from channel_post_reactions_conversations Hasure Event Trigger
   * didn't found amy Action or Event Trigger in Hsaura
   */
  @Post('/channel-post-reactions-comment-count')
  async updateChannelPostReactionCommentCount(@Body() body: any) {
    const operationType: string = body.event.op;
    const {
      event: { data },
    } = body;
    return this.communityService.updateTotaReactionsOfChannelPostReaction(
      data,
      operationType,
    );
  }

  /**
   * @deprecated Triggered from channel_post_reactions_conversations_likes Hasure Event Trigger
   * It's migrated in updatelikePostReactionConversation Resolver but app team is  using this migration
   */
  @Post('/channel-post-reactions-comment-likes')
  async updateChannelPostReactionsCommentLikesCount(@Body() body: any) {
    const operationType: string = body.event.op;
    const {
      event: { data },
    } = body;
    return this.communityService.updateTotaLikesOfChannelPostReactionComment(
      operationType == OperationTypes.INSERT ? data.new : data.old,
      operationType,
    );
  }
}
