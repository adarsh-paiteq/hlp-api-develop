import { BullModule, BullModuleOptions, InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { UserTrophy } from '../trophies/trophies.dto';
import { ChannelPostReaction } from '../channels/channels.dto';
import { UserGoalLevel } from '../goals/goals.dto';
import { UserMembershipLevel } from '../membership-levels/membership-levels.dto';
import { UserMembershipStage } from '../membership-stages/entities/user-membership-stages.entity';
import { ScheduleSessionDto } from '../schedule-sessions/schedule-sessions.dto';
import { UserStreak } from '../streaks/streaks.dto';
import { UserDonation } from '../users/users.dto';
import { UserCheckinLevel } from '../checkins/checkins.dto';
import { UserBlogRead } from '../blog-posts/blogs-posts.model';
import { UserBonus } from '../bonuses/bonuses.dto';
import { UserChallenges } from '../challenges/challenges.dto';
import { PostThankYouEvent } from '../channels/channels.event';
import { ChallengeWonEvent } from '../challenges/challenges.event';
import { defaultJobOptions } from '@core/configs/bull.config';
import { ChannelUserPost } from '../channels/entities/channel-user-posts.entity';
import { AdminPostRead } from '../admin-post-reads/entities/admin-post-read.entity';
import { UserMoodCheck } from '../user-mood-checks/entities/user-mood-check.entity';
import { UserChannel } from '../channels/entities/user-channel.entity';
import { UserFormAnswer } from '../forms/entities/user-form-answer.entity';

export const REWARDS_QUEUE = 'rewards';
export const RewardsQueueConfig: BullModuleOptions = {
  name: REWARDS_QUEUE,
  defaultJobOptions: defaultJobOptions,
};
export enum RewardsJob {
  ADD_TOOLKIT_REWARD = '[REWARDS]ADD_TOOLKIT_REWARD',
  ADD_USER_TOOLKIT_REWARD = '[REWARDS]ADD_USER_TOOLKIT_REWARD',
  ADD_STREAK_REWARD = '[REWARDS]ADD_STREAK_REWARD',
  ADD_STAGE_REWARD = '[REWARDS] ADD_STAGE_REWARD',
  ADD_LEVEL_REWARD = '[REWARD] ADD_LEVEL_REWARD',
  ADD_DONATION_REWARD = '[REWARD] ADD DONATION REWARD',
  ADD_GOAL_LEVEL_REWARD = '[REWARD] ADD GOAL LEVEL REWARD',
  ADD_CHANNEL_FOLLOWED_REWARD = '[REWARD]ADD_CHANNEL_FOLLOWED_REWARD',
  ADD_CHANNEL_POST_REWARD = '[REWARD]ADD_CHANNEL_POST_REWARD',
  ADD_CHANNEL_POST_REACTION_REWARD = '[REWARD]ADD_CHANNEL_POST_REACTION_REWARD',
  ADD_TROPHY_ACHIVED_REWARD = '[REWARDS]ADD_TROPHY_ACHIVED_REWARD',
  ADD_CHECKIN_LEVEL_REWARD = '[REWARDS]ADD_CHECKIN_LEVEL_REWARD',
  ADD_BLOG_READ_REWARD = '[REWARDS]ADD_BLOG_READ_REWARD',
  ADD_BONUS_CLAIMED_REWARD = '[REWARDS] ADD_BONUS_CLAIMED_REWARD',
  ADD_CHALLENGE_GOAL_COMPLETION_REWARD = '[REWARDS]ADD_CHALLENGE_GOAL_COMPETION_REWARD',
  ADD_CHANNEL_POST_THANK_YOU_REWARD = '[REWARD]ADD_CHANNEL_POST_THANK_YOU_REWARD',
  ADD_CHALLENGE_WON_REWARD = '[REWARDS]ADD_CHALLENGE_WON_REWARD',
  ADD_ADMIN_POST_READ_REWARD = '[REWARDS]ADD_ADMIN_POST_READ_REWARD',
  ADD_USER_MOOD_CHECK_REWARD = '[REWARDS]ADD_USER_MOOD_CHECK_REWARD',
  ADD_FORM_REWARD = ' [REWARD] ADD_FORM_REWARD',
}

export const registerRewardsQueue =
  BullModule.registerQueueAsync(RewardsQueueConfig);

@Injectable()
export class RewardsQueue {
  constructor(
    @InjectQueue(REWARDS_QUEUE) private readonly rewardsQueue: Queue,
  ) {}

  async addToolkitReward(session: ScheduleSessionDto): Promise<unknown> {
    return this.rewardsQueue.add(RewardsJob.ADD_TOOLKIT_REWARD, session);
  }
  async addUserToolkitReward(session: ScheduleSessionDto): Promise<unknown> {
    return this.rewardsQueue.add(RewardsJob.ADD_USER_TOOLKIT_REWARD, session);
  }
  async addStreakReward(userStreak: UserStreak): Promise<unknown> {
    return this.rewardsQueue.add(RewardsJob.ADD_STREAK_REWARD, userStreak);
  }
  async addStageReward(
    userMembershipStage: UserMembershipStage,
  ): Promise<void> {
    await this.rewardsQueue.add(
      RewardsJob.ADD_STAGE_REWARD,
      userMembershipStage,
    );
  }

  async addLevelReward(
    userMembershipLevel: UserMembershipLevel,
  ): Promise<void> {
    await this.rewardsQueue.add(
      RewardsJob.ADD_LEVEL_REWARD,
      userMembershipLevel,
    );
  }

  async addDonationReward(donation: UserDonation): Promise<void> {
    await this.rewardsQueue.add(RewardsJob.ADD_DONATION_REWARD, donation);
  }

  async addGoalLevelReward(userGoalLevel: UserGoalLevel): Promise<void> {
    await this.rewardsQueue.add(
      RewardsJob.ADD_GOAL_LEVEL_REWARD,
      userGoalLevel,
    );
  }

  async addChannelFollowedReward(userChannel: UserChannel): Promise<void> {
    await this.rewardsQueue.add(
      RewardsJob.ADD_CHANNEL_FOLLOWED_REWARD,
      userChannel,
    );
  }

  async addChannelPostAddedReward(channelPost: ChannelUserPost): Promise<void> {
    await this.rewardsQueue.add(
      RewardsJob.ADD_CHANNEL_POST_REWARD,
      channelPost,
    );
  }

  async addChannelPostReactionReward(
    channelPostReaction: ChannelPostReaction,
  ): Promise<void> {
    await this.rewardsQueue.add(
      RewardsJob.ADD_CHANNEL_POST_REACTION_REWARD,
      channelPostReaction,
    );
  }

  async addTrophiesAchievedReward(trophy: UserTrophy): Promise<void> {
    await this.rewardsQueue.add(RewardsJob.ADD_TROPHY_ACHIVED_REWARD, trophy);
  }

  async addCheckinLevelReward(checkin: UserCheckinLevel): Promise<void> {
    await this.rewardsQueue.add(RewardsJob.ADD_CHECKIN_LEVEL_REWARD, checkin);
  }
  async addUserBlogReadReward(userBlogRead: UserBlogRead): Promise<void> {
    await this.rewardsQueue.add(RewardsJob.ADD_BLOG_READ_REWARD, userBlogRead);
  }
  async addBonusClaimedReward(userBonus: UserBonus): Promise<void> {
    await this.rewardsQueue.add(RewardsJob.ADD_BONUS_CLAIMED_REWARD, userBonus);
  }

  async addChallengeGoalCompletionReward(
    userChallenge: UserChallenges,
  ): Promise<void> {
    await this.rewardsQueue.add(
      RewardsJob.ADD_CHALLENGE_GOAL_COMPLETION_REWARD,
      userChallenge,
    );
  }
  async addChannelPostThankYouReward(
    channelPostThankYou: PostThankYouEvent,
  ): Promise<void> {
    await this.rewardsQueue.add(
      RewardsJob.ADD_CHANNEL_POST_THANK_YOU_REWARD,
      channelPostThankYou,
    );
  }

  async addChallengeWonReward(challengeWon: ChallengeWonEvent): Promise<void> {
    await this.rewardsQueue.add(
      RewardsJob.ADD_CHALLENGE_WON_REWARD,
      challengeWon,
    );
  }
  async addAdminPostReadReward(adminPostRead: AdminPostRead): Promise<void> {
    await this.rewardsQueue.add(
      RewardsJob.ADD_ADMIN_POST_READ_REWARD,
      adminPostRead,
    );
  }

  async addUserMoodCheckReward(userMoodCheck: UserMoodCheck): Promise<void> {
    await this.rewardsQueue.add(
      RewardsJob.ADD_USER_MOOD_CHECK_REWARD,
      userMoodCheck,
    );
  }
  async addUserReward(userFormAnswer: UserFormAnswer): Promise<void> {
    await this.rewardsQueue.add(RewardsJob.ADD_FORM_REWARD, userFormAnswer);
  }
}
