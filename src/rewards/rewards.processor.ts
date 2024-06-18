import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import Bull from 'bull';
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
import { REWARDS_QUEUE, RewardsJob } from './rewards.queue';
import { RewardsService } from './rewards.service';
import { defaultWorkersConcurrency } from '@core/configs/bull.config';
import { ChannelUserPost } from '../channels/entities/channel-user-posts.entity';
import { AdminPostRead } from '../admin-post-reads/entities/admin-post-read.entity';
import { UserMoodCheck } from '../user-mood-checks/entities/user-mood-check.entity';
import { UserChannel } from '../channels/entities/user-channel.entity';
import { UserFormAnswer } from '../forms/entities/user-form-answer.entity';
import { ProcessorLogger } from '@core/helpers/processor-logging.helper';
@Processor(REWARDS_QUEUE)
export class RewardsProcessor extends ProcessorLogger {
  readonly logger = new Logger(RewardsProcessor.name);
  constructor(private readonly rewardsService: RewardsService) {
    super();
  }

  @Process({
    name: RewardsJob.ADD_TOOLKIT_REWARD,
    concurrency: defaultWorkersConcurrency,
  })
  async addToolKitReward(job: Bull.Job<ScheduleSessionDto>): Promise<string> {
    const { data: scheduleSession } = job;
    try {
      this.logger.log(
        `${scheduleSession.schedule_id} session added add toolkit reward`,
      );

      if (!scheduleSession.tool_kit_id) {
        return 'Toolkit id not found';
      }

      await this.rewardsService.addToolKitReward(
        scheduleSession.user_id,
        scheduleSession.tool_kit_id,
      );
      return 'Toolkit Reward Added';
    } catch (error) {
      this.logger.error(`${this.addToolKitReward.name}:${error.stack}`);
      throw error;
    }
  }

  @Process({
    name: RewardsJob.ADD_USER_TOOLKIT_REWARD,
    concurrency: defaultWorkersConcurrency,
  })
  async addUserToolKitReward(
    job: Bull.Job<ScheduleSessionDto>,
  ): Promise<string> {
    const { data: scheduleSession } = job;
    try {
      if (!scheduleSession.user_toolkit_id) {
        return 'user_toolkit_id not found';
      }

      return await this.rewardsService.addUserToolKitReward(
        scheduleSession.user_id,
        scheduleSession.user_toolkit_id,
      );
    } catch (error) {
      this.logger.error(`${this.addUserToolKitReward.name}:${error.stack}`);
      throw error;
    }
  }

  @Process({
    name: RewardsJob.ADD_STREAK_REWARD,
    concurrency: defaultWorkersConcurrency,
  })
  async addStreakReward(job: Bull.Job<UserStreak>): Promise<string> {
    const { data: streak } = job;
    try {
      this.logger.log(`add streak reward session added`);
      return this.rewardsService.addStreakReward(streak);
    } catch (error) {
      this.logger.error(`${this.addStreakReward.name}:${error.stack}`);
      throw error;
    }
  }

  @Process({
    name: RewardsJob.ADD_STAGE_REWARD,
    concurrency: defaultWorkersConcurrency,
  })
  async stageReward(job: Bull.Job<UserMembershipStage>): Promise<string> {
    try {
      const { data: stage } = job;

      this.logger.log(`Add stage reward`);
      const response = await this.rewardsService.addMembershipStageReward({
        user_id: stage.user_id,
        membership_stage_id: stage.membership_stage_id,
      });
      return response;
    } catch (error) {
      this.logger.error(`${this.stageReward.name}:${error.stack}`);
      throw error;
    }
  }

  @Process({
    name: RewardsJob.ADD_LEVEL_REWARD,
    concurrency: defaultWorkersConcurrency,
  })
  async levelReward(job: Bull.Job<UserMembershipLevel>): Promise<string> {
    try {
      const { data: stage } = job;

      this.logger.log(`Add level reward`);
      const response = await this.rewardsService.addMembershipLevelReward({
        user_id: stage.user_id,
        membership_level_id: stage.membership_level_id,
      });
      return response;
    } catch (error) {
      this.logger.error(`${this.levelReward.name}:${error.stack}`);
      throw error;
    }
  }

  @Process({
    name: RewardsJob.ADD_DONATION_REWARD,
    concurrency: defaultWorkersConcurrency,
  })
  async addDonationReward(job: Bull.Job<UserDonation>): Promise<string> {
    try {
      const { data: donation } = job;
      this.logger.log(`Add donation reward`);
      const message = await this.rewardsService.addDonationReward(donation);
      return message;
    } catch (error) {
      this.logger.error(`${this.addDonationReward.name}:${error.stack}`);
      throw error;
    }
  }

  @Process({
    name: RewardsJob.ADD_GOAL_LEVEL_REWARD,
    concurrency: defaultWorkersConcurrency,
  })
  async goalLevelReward(job: Bull.Job<UserGoalLevel>): Promise<string> {
    try {
      const { data: userGoalLevel } = job;

      this.logger.log(`Add Goal level reward`);
      const response = await this.rewardsService.addGoalLevelReward({
        user_id: userGoalLevel.user_id,
        goal_level_id: userGoalLevel.goal_level_id,
      });
      return response;
    } catch (error) {
      this.logger.error(`${this.goalLevelReward.name}:${error.stack}`);
      throw error;
    }
  }

  @Process({
    name: RewardsJob.ADD_CHANNEL_FOLLOWED_REWARD,
    concurrency: defaultWorkersConcurrency,
  })
  async channelFollowedReward(job: Bull.Job<UserChannel>): Promise<string> {
    try {
      const { data: userChannel } = job;

      this.logger.log(`Add Channel Followed Reward`);
      const response = await this.rewardsService.addchannelFollowedReward(
        userChannel,
      );
      return response;
    } catch (error) {
      this.logger.error(`${this.channelFollowedReward.name}:${error.stack}`);
      throw error;
    }
  }

  @Process({
    name: RewardsJob.ADD_CHANNEL_POST_REWARD,
    concurrency: defaultWorkersConcurrency,
  })
  async channelPostAddedReward(
    job: Bull.Job<ChannelUserPost>,
  ): Promise<string> {
    try {
      const { data: channelPost } = job;
      const response = await this.rewardsService.addchannelPostReward(
        channelPost,
      );
      return response;
    } catch (error) {
      this.logger.error(`${this.channelPostAddedReward.name}:${error.stack}`);
      throw error;
    }
  }

  @Process({
    name: RewardsJob.ADD_CHANNEL_POST_REACTION_REWARD,
    concurrency: defaultWorkersConcurrency,
  })
  async channelPostReactionReward(
    job: Bull.Job<ChannelPostReaction>,
  ): Promise<string> {
    try {
      const { data: channelPostReaction } = job;

      this.logger.log(`Add Channel Post Reaction Reward`);
      const response = await this.rewardsService.addchannelPostReactionReward(
        channelPostReaction,
      );
      return response;
    } catch (error) {
      this.logger.error(
        `${this.channelPostReactionReward.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: RewardsJob.ADD_TROPHY_ACHIVED_REWARD,
    concurrency: defaultWorkersConcurrency,
  })
  async trophiesAchievedReward(job: Bull.Job<UserTrophy>): Promise<string> {
    try {
      const { data: trophy } = job;
      const response = await this.rewardsService.addTrophyAchievedReward(
        trophy,
      );
      this.logger.log(response);
      return response;
    } catch (error) {
      this.logger.error(`${this.trophiesAchievedReward.name}:${error.stack}`);
      throw error;
    }
  }

  @Process({
    name: RewardsJob.ADD_CHECKIN_LEVEL_REWARD,
    concurrency: defaultWorkersConcurrency,
  })
  async checkinLevelReward(job: Bull.Job<UserCheckinLevel>): Promise<string> {
    try {
      const { data: UserCheckinLevel } = job;
      this.logger.log(`Add checkin Level Reward`);
      const response = await this.rewardsService.addCheckindReward(
        UserCheckinLevel,
      );
      this.logger.log(response);
      return response;
    } catch (error) {
      this.logger.error(`${this.checkinLevelReward.name}:${error.stack}`);
      throw error;
    }
  }
  @Process({
    name: RewardsJob.ADD_BLOG_READ_REWARD,
    concurrency: defaultWorkersConcurrency,
  })
  async blogReadReward(job: Bull.Job<UserBlogRead>): Promise<string> {
    try {
      const { data: userBlogRead } = job;
      this.logger.log(`Add blog read Reward`);
      const response = await this.rewardsService.addBlogReadReward(
        userBlogRead,
      );
      this.logger.log(response);
      return response;
    } catch (error) {
      this.logger.error(`${this.blogReadReward.name}:${error.stack}`);
      throw error;
    }
  }
  @Process({
    name: RewardsJob.ADD_BONUS_CLAIMED_REWARD,
    concurrency: defaultWorkersConcurrency,
  })
  async bonusClaimedReward(job: Bull.Job<UserBonus>): Promise<string> {
    try {
      const { data: userBonus } = job;

      this.logger.log(`Add bonus claimed reward`);
      const response = await this.rewardsService.addBonusClaimedReward(
        userBonus,
      );
      return response;
    } catch (error) {
      this.logger.error(`${this.bonusClaimedReward.name}:${error.stack}`);
      throw error;
    }
  }

  @Process({
    name: RewardsJob.ADD_CHALLENGE_GOAL_COMPLETION_REWARD,
    concurrency: defaultWorkersConcurrency,
  })
  async challengeGoalCompletionReward(
    job: Bull.Job<UserChallenges>,
  ): Promise<string> {
    try {
      const { data: userChallenge } = job;
      this.logger.log(`Add challenge goal completion Reward`);
      return this.rewardsService.addChallengeGoalCompletedReward(userChallenge);
    } catch (error) {
      this.logger.error(
        `${this.challengeGoalCompletionReward.name}:${error.stack}`,
      );
      throw error;
    }
  }
  @Process({
    name: RewardsJob.ADD_CHANNEL_POST_THANK_YOU_REWARD,
    concurrency: defaultWorkersConcurrency,
  })
  async channelPostThankYouReward(
    job: Bull.Job<PostThankYouEvent>,
  ): Promise<string> {
    try {
      const { data: postThankYou } = job;
      this.logger.log(`Add Channel Post Thank You Reward`);
      const response = await this.rewardsService.addChannelPostThankYouReward(
        postThankYou,
      );
      return response;
    } catch (error) {
      this.logger.error(
        `${this.channelPostThankYouReward.name}:${error.stack}`,
      );
      throw error;
    }
  }

  @Process({
    name: RewardsJob.ADD_CHALLENGE_WON_REWARD,
    concurrency: defaultWorkersConcurrency,
  })
  async challengeWonReward(job: Bull.Job<ChallengeWonEvent>): Promise<string> {
    try {
      const { data: ChallengeWonEvent } = job;
      this.logger.log(`Add challenge won Reward`);
      const response = await this.rewardsService.addChallengeWonReward(
        ChallengeWonEvent,
      );
      this.logger.log(response);
      return response;
    } catch (error) {
      this.logger.error(`${this.challengeWonReward.name}:${error.stack}`);
      throw error;
    }
  }

  @Process({
    name: RewardsJob.ADD_ADMIN_POST_READ_REWARD,
    concurrency: defaultWorkersConcurrency,
  })
  async adminPostReadReward(job: Bull.Job<AdminPostRead>): Promise<string> {
    try {
      const { data: adminPostRead } = job;
      this.logger.log(`Add post read Reward`);
      const response = await this.rewardsService.addAdminPostReadReward(
        adminPostRead,
      );
      this.logger.log(response);
      return response;
    } catch (error) {
      this.logger.error(`${this.adminPostReadReward.name}:${error.stack}`);
      throw error;
    }
  }

  @Process({
    name: RewardsJob.ADD_USER_MOOD_CHECK_REWARD,
    concurrency: defaultWorkersConcurrency,
  })
  async addUserMoodCheckReward(job: Bull.Job<UserMoodCheck>): Promise<string> {
    try {
      const { data: userMoodCheck } = job;
      this.logger.log(`Add user mood check Reward`);
      const response = await this.rewardsService.addUserMoodCheckReward(
        userMoodCheck,
      );
      this.logger.log(response);
      return response;
    } catch (error) {
      this.logger.error(`${this.addUserMoodCheckReward.name}:${error.stack}`);
      throw error;
    }
  }
  @Process({
    name: RewardsJob.ADD_FORM_REWARD,
    concurrency: defaultWorkersConcurrency,
  })
  async userReward(job: Bull.Job<UserFormAnswer>): Promise<string> {
    try {
      const { data: userFormAnswer } = job;

      this.logger.log(`Add user reward`);
      const response = await this.rewardsService.addUserReward(userFormAnswer);
      return response;
    } catch (error) {
      this.logger.error(`${this.userReward.name}:${error.stack}`);
      throw error;
    }
  }
}
