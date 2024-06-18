import { Injectable } from '@nestjs/common';
import { HasuraService } from '../shared/services/hasura/hasura.service';
import { gql } from 'graphql-request';
import {
  ChannelFollowedReward,
  ChannelPostReactionReward,
  ChannelPostReward,
  RewardChannelPostReaction,
  RewardInput,
  RewardType,
  RewardUserCheckinLevel,
  ToolkitStreakWithToolkitDto,
  UserReward,
} from './rewards.dto';
import { ChannelPost, ChannelPostReaction } from '../channels/channels.dto';
import { Database } from '../core/modules/database/database.service';
import { UserBlogRead } from '../blog-posts/blogs-posts.model';
import { Bonus, UserBonus } from '../bonuses/bonuses.dto';
import { ChallengeResponse } from '../challenges/challenges.model';
import { UserRewards } from './entities/user-rewards.entity';
import { UserPost } from '../channels/channels.model';
import { Toolkit } from '../toolkits/toolkits.model';
import { MoodCheckCategory } from '../user-mood-checks/entities/mood-check-category.entity';
import { Channel } from '../channels/entities/channel.entity';
import { Trophy } from '../trophies/entities/trophy.entity';
import { UserTookit } from '../toolkits/entities/user-toolkits.entity';
import { Users } from '@users/users.model';

/**
 * @description   FSragments that are utilized in the @function getRewardByDonationIdQuery() function within the users repository. It should be noted that this repository is unused code.  
   Additionally, the fragments are also used in the @function getRewardByDonationIdQuery(),@function getChannelRewardQuery(), @function getUserPostRewardQuery(), and @function getPostReactionRewardQuery() functions within the rewards repository.
 */
export const rewardFragment = gql`
  fragment reward on user_rewards {
    id
    reward_type
    membership_level_id
    membership_stage_id
    trophy_id
    hlp_reward_points_awarded
    challenge_id
    streak_id
    created_at
    updated_at
    user_id
    tool_kit_id
    user_donation_id
    channel_id
    channel_post_id
    post_reaction_id
    checkin_level_id
  }
`;

@Injectable()
export class RewardsRepo {
  constructor(
    private readonly client: HasuraService,
    private readonly database: Database,
  ) {}

  async addReward(reward: RewardInput): Promise<UserRewards> {
    const keys = Object.keys(reward);
    const values = Object.values(reward);
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    const columns = keys.join(', ');
    const query = `INSERT INTO user_rewards (${columns}) VALUES (${placeholders}) RETURNING *;`;
    const [userReward] = await this.database.query<UserRewards>(query, values);
    return userReward;
  }

  /**
   * @description The @function getStreakById() function is used in the rewards repository.
   */

  async getToolKitById(toolkitId: string): Promise<Toolkit> {
    const query = `SELECT * FROM tool_kits WHERE id=$1`;
    const [toolkit] = await this.database.query<Toolkit>(query, [toolkitId]);
    return toolkit;
  }

  async getUserToolKitById(
    userToolkitId: string,
    userId: string,
  ): Promise<UserTookit> {
    const query = `SELECT * FROM user_toolkits WHERE id=$1 AND user_id =$2`;
    const [userToolkit] = await this.database.query<UserTookit>(query, [
      userToolkitId,
      userId,
    ]);
    return userToolkit;
  }

  /**
   * @description The @function addStreakReward()  function is used in the rewards repository.
   */

  async getStreakAndToolkit(id: string): Promise<ToolkitStreakWithToolkitDto> {
    const query = ` SELECT toolkit_streaks.*, ROW_TO_JSON(tool_kits.*) AS toolkit
    FROM toolkit_streaks 
    INNER JOIN tool_kits ON toolkit_streaks.tool_kit = tool_kits.id
    WHERE toolkit_streaks.id = $1`;
    const [toolKitStreakWithToolkit] =
      await this.database.query<ToolkitStreakWithToolkitDto>(query, [id]);
    return toolKitStreakWithToolkit;
  }

  async getEarnedPoints(userId: string): Promise<number> {
    const query = `SELECT COALESCE(SUM(hlp_reward_points_awarded),0) AS earned FROM user_rewards WHERE user_id=$1 AND user_rewards.reward_type NOT IN ('HLP_DONATION','CHANNEL_POST_THANK_YOU');`;
    const [{ earned }] = await this.database.query<{ earned: number }>(query, [
      userId,
    ]);
    return Number(earned);
  }

  async getReceivedPoints(userId: string): Promise<number> {
    const query = `SELECT COALESCE(SUM(hlp_reward_points_awarded),0) AS received FROM user_rewards WHERE user_id=$1 AND user_rewards.reward_type IN ('HLP_DONATION','CHANNEL_POST_THANK_YOU');`;
    const [{ received }] = await this.database.query<{ received: number }>(
      query,
      [userId],
    );
    return Number(received);
  }

  /**
   * @description The @function getUserBalance() function is used in the rewards service while the @function getUserScore() function is used in the users service.
   */
  async getUserBalance(userId: string): Promise<{
    earned: number;
    received: number;
  }> {
    const [earned, received] = await Promise.all([
      this.getEarnedPoints(userId),
      this.getReceivedPoints(userId),
    ]);
    return {
      earned,
      received,
    };
  }

  /**
   * @description The @function getRewardByDonationId() function is used in the rewards repository.
   */
  private getRewardByDonationIdQuery(): string {
    const query = gql`
      query ($donation_id: uuid!) {
        user_rewards(where: { user_donation_id: { _eq: $donation_id } }) {
          ...reward
        }
      }
      ${rewardFragment}
    `;
    return query;
  }

  /**
   * @description The @function addDonationReward() function in the rewards service utilizes a repository.
   */
  async getRewardByDonationId(id: string): Promise<UserReward> {
    const query = this.getRewardByDonationIdQuery();
    type result = { reward: UserReward };
    const { reward } = await this.client.request<result>(query, {
      donation_id: id,
    });
    return reward;
  }

  /**
   * @deprecated The Repo used in The @function getChannelReward() function is used in the rewards repository.it is used for Get Reward for Channel but This code is no longer used and can be safely removed.
   */
  private getChannelRewardQuery(): string {
    const query = gql`
      query ($user_id: uuid!, $channel_id: uuid!) {
        user_rewards(
          where: {
            user_id: { _eq: $user_id }
            channel_id: { _eq: $channel_id }
          }
        ) {
          ...reward
        }
      }
      ${rewardFragment}
    `;
    return query;
  }

  /**
   * @deprecated The Repo used in The @function getUserPostReward() function is used in the rewards repository.
   */
  private getUserPostRewardQuery(): string {
    const query = gql`
      query ($user_id: uuid!, $channel_post_id: uuid!) {
        user_rewards(
          where: {
            user_id: { _eq: $user_id }
            channel_post_id: { _eq: $channel_post_id }
          }
        ) {
          ...reward
        }
      }
      ${rewardFragment}
    `;
    return query;
  }

  /**
   * @deprecated This code is no longer used and can be safely removed.
   */
  async getChannelReward(
    user_id: string,
    channel_id: string,
  ): Promise<ChannelFollowedReward[]> {
    const query = this.getChannelRewardQuery();
    type result = { user_rewards: Array<ChannelFollowedReward> };
    const { user_rewards } = await this.client.request<result>(query, {
      user_id: user_id,
      channel_id: channel_id,
    });
    return user_rewards;
  }

  /**
   * @deprecated This code is no longer used and can be safely removed.
   */
  async getUserPostReward(
    userChannelPost: ChannelPost,
  ): Promise<ChannelPostReward[]> {
    const { user_id, id } = userChannelPost;
    const query = this.getUserPostRewardQuery();
    type result = { user_rewards: Array<ChannelPostReward> };
    const { user_rewards } = await this.client.request<result>(query, {
      user_id: user_id,
      channel_post_id: id,
    });
    return user_rewards;
  }

  async getPostReactionReward(
    channelPostReaction: ChannelPostReaction,
  ): Promise<ChannelPostReactionReward> {
    const { id, user_id } = channelPostReaction;
    const query = `SELECT * FROM user_rewards WHERE user_rewards.post_reaction_id =$1 AND user_rewards.user_id = $2`;
    const [userReward] = await this.database.query<ChannelPostReactionReward>(
      query,
      [id, user_id],
    );
    return userReward;
  }

  async getUserAchivedTrophy(userTrophyId: string): Promise<Trophy> {
    const query = `SELECT trophies.* FROM user_trophies
    LEFT JOIN trophies ON trophies.id = user_trophies.trophy_id
    WHERE user_trophies.id= $1`;
    const [trophy] = await this.database.query<Trophy>(query, [userTrophyId]);
    return trophy;
  }

  async getUserPostReaction(
    reactionId: string,
    userId: string,
  ): Promise<RewardChannelPostReaction> {
    const query = `SELECT *,channels.title as channel_title FROM channel_post_reactions
    INNER JOIN channels ON channel_id=channels.id
    WHERE channel_post_reactions.id=$2 AND user_id=$1`;
    const [postReaction] = await this.database.query<RewardChannelPostReaction>(
      query,
      [userId, reactionId],
    );
    return postReaction;
  }

  async getUserCheckinLevel(
    check_in_level_id: string,
    userId: string,
  ): Promise<RewardUserCheckinLevel> {
    const query = `SELECT check_in_levels.title,check_in_levels.hlp_reward_points_to_be_awarded,check_in_levels.translations  FROM check_in_levels
    INNER JOIN user_check_in_levels ON check_in_levels.id = user_check_in_levels.check_in_level_id
    WHERE user_check_in_levels.user_id=$2 AND check_in_levels.id=$1`;
    const [checkin] = await this.database.query<RewardUserCheckinLevel>(query, [
      check_in_level_id,
      userId,
    ]);
    return checkin;
  }
  async getUserRewardsForBlogRead(
    user_id: string,
    blog_id: string,
  ): Promise<UserRewards[]> {
    const query = `
    SELECT * FROM user_rewards WHERE user_id=$1 AND blog_id=$2;
    `;
    const data = await this.database.query<UserRewards>(query, [
      user_id,
      blog_id,
    ]);
    return data;
  }
  async getUserBlogRead(
    user_id: string,
    blog_id: string,
  ): Promise<UserBlogRead[]> {
    const query = `
    SELECT user_blog_reads.*,
    title,
    translations
    FROM blog_posts
    LEFT JOIN user_blog_reads ON user_blog_reads.blog_id=blog_posts.id
    WHERE user_blog_reads.user_id=$1 AND
    user_blog_reads.blog_id=$2;
    `;
    const data = await this.database.query<UserBlogRead>(query, [
      user_id,
      blog_id,
    ]);
    return data;
  }
  async getBonusById(bonus_id: string): Promise<Bonus> {
    const query = `
    SELECT * FROM bonuses WHERE id=$1;
    `;
    const [data] = await this.database.query<Bonus>(query, [bonus_id]);
    return data;
  }
  async getUserBonuses(
    user_id: string,
    bonus_id: string,
  ): Promise<UserBonus[]> {
    const query = `
    SELECT user_bonus_claimed.*
    FROM bonuses
    LEFT JOIN user_bonus_claimed ON user_bonus_claimed.bonus_id=bonuses.id
    WHERE user_bonus_claimed.user_id=$1 AND
    user_bonus_claimed.bonus_id=$2;
    `;
    const data = await this.database.query<UserBonus>(query, [
      user_id,
      bonus_id,
    ]);
    return data;
  }
  async getUserRewardsForBonusClaimed(
    user_id: string,
    bonus_id: string,
  ): Promise<UserRewards[]> {
    const query = `
    SELECT * FROM user_rewards WHERE user_id=$1 AND bonus_id=$2;
    `;
    const data = await this.database.query<UserRewards>(query, [
      user_id,
      bonus_id,
    ]);
    return data;
  }

  async getUserChallengeRewards(
    user_id: string,
    challenge_id: string,
    reward_type: RewardType,
  ): Promise<UserRewards> {
    const query = `
    SELECT * FROM user_rewards WHERE user_id = $1 AND
    challenge_id = $2 AND reward_type = $3;`;
    const [data] = await this.database.query<UserRewards>(query, [
      user_id,
      challenge_id,
      reward_type,
    ]);
    return data;
  }

  async getUserPostByPostId(
    postId: string,
  ): Promise<{ user_id: string; message: string }> {
    const query = `SELECT * FROM channel_user_posts
    WHERE id = $1`;
    const [user] = await this.database.query<{
      user_id: string;
      message: string;
    }>(query, [postId]);
    return user;
  }

  async getChallengeById(challegeId: string): Promise<ChallengeResponse> {
    const query = `SELECT * FROM challenges WHERE id = $1`;
    const [challenge] = await this.database.query<ChallengeResponse>(query, [
      challegeId,
    ]);
    return challenge;
  }

  async getChannelFollowedReward(
    userId: string,
    channelId: string,
    rewardType: RewardType,
  ): Promise<UserRewards> {
    const query = `SELECT * FROM user_rewards WHERE channel_id = $1 AND user_id = $2 AND reward_type = $3`;
    const [userReward] = await this.database.query<UserRewards>(query, [
      channelId,
      userId,
      rewardType,
    ]);
    return userReward;
  }

  async getChannelById(channelId: string): Promise<Channel> {
    const query = `SELECT * FROM channels WHERE id = $1`;
    const [userReward] = await this.database.query<Channel>(query, [channelId]);
    return userReward;
  }

  async getMembershipStageReward(
    userId: string,
    membershipStageId: string,
  ): Promise<UserRewards> {
    const query = `SELECT * FROM user_rewards WHERE membership_stage_id = $1 AND user_id = $2`;
    const [userReward] = await this.database.query<UserRewards>(query, [
      membershipStageId,
      userId,
    ]);
    return userReward;
  }

  async getChannelPostReward(
    userId: string,
    channelPostId: string,
    rewardType: RewardType,
  ): Promise<UserRewards> {
    const query = `SELECT * FROM user_rewards WHERE channel_post_id = $1 AND user_id = $2 AND reward_type = $3`;
    const [userReward] = await this.database.query<UserRewards>(query, [
      channelPostId,
      userId,
      rewardType,
    ]);
    return userReward;
  }

  async getAdminPostTitle(
    user_id: string,
    admin_post_id: string,
  ): Promise<UserPost[]> {
    const query = `
    SELECT title FROM channel_user_posts
    WHERE id = $1 AND user_id = $2
    `;
    const data = await this.database.query<UserPost>(query, [
      admin_post_id,
      user_id,
    ]);
    return data;
  }

  async getAdminRewardsForPostRead(
    user_id: string,
    channel_post_id: string,
  ): Promise<UserRewards[]> {
    const query = `
    SELECT * FROM user_rewards WHERE user_id=$1 AND channel_post_id=$2;
    `;
    const data = await this.database.query<UserRewards>(query, [
      user_id,
      channel_post_id,
    ]);
    return data;
  }
  async getUserTrophyReward(
    userId: string,
    trophy_id: string,
    rewardType: RewardType,
  ): Promise<UserRewards> {
    const query = `SELECT * FROM user_rewards WHERE trophy_id = $1 AND user_id = $2 AND reward_type = $3`;
    const [userReward] = await this.database.query<UserRewards>(query, [
      trophy_id,
      userId,
      rewardType,
    ]);
    return userReward;
  }

  async getUserRewardsForMoodCheck(
    user_id: string,
    user_mood_check_id: string,
  ): Promise<UserRewards[]> {
    const query = `
    SELECT * FROM user_rewards WHERE user_id=$1 AND user_mood_check_id=$2;
    `;
    const data = await this.database.query<UserRewards>(query, [
      user_id,
      user_mood_check_id,
    ]);
    return data;
  }

  async getUserMoodCheckTitle(category_id: string): Promise<MoodCheckCategory> {
    const query = `
    SELECT title ,translations FROM mood_check_categories
    WHERE id = $1
    `;
    const [data] = await this.database.query<MoodCheckCategory>(query, [
      category_id,
    ]);
    return data;
  }

  async getUserRewardHistory(userId: string): Promise<UserRewards[]> {
    const query = `
    SELECT * from user_rewards
    WHERE user_id = $1
    ORDER BY created_at DESC
    `;
    const data = await this.database.query<UserRewards>(query, [userId]);
    return data;
  }

  async getUserGoalLevelReward(
    userId: string,
    goalLevelId: string,
  ): Promise<UserRewards> {
    const query = `SELECT user_rewards.* FROM user_rewards
    WHERE user_rewards.user_id = $1 AND user_rewards.goal_level_id = $2 AND reward_type = $3`;
    const [userReward] = await this.database.query<UserRewards>(query, [
      userId,
      goalLevelId,
      RewardType.GOAL_LEVEL,
    ]);
    return userReward;
  }

  async getUserById(userId: string): Promise<Users> {
    const query = `SELECT * FROM users WHERE id=$1`;
    const [user] = await this.database.query<Users>(query, [userId]);
    return user;
  }
}
