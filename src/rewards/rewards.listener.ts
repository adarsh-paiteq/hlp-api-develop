import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { GoalsEvent, GoalsLevelSavedEvent } from '../goals/goals.event';
import { BonusClaimedEvent, BonusesEvent } from '../bonuses/bonuses.event';
import {
  ChallengeGoalCompletedEvent,
  ChallengesEvent,
  ChallengeWonEvent,
} from '../challenges/challenges.event';
import {
  MembershipLevelSavedEvent,
  MembershipLevelsEvent,
} from '../membership-levels/membership-levels.event';
import {
  MembershipStageSavedEvent,
  MembershipStagesEvent,
} from '../membership-stages/membership-stages.event';
import {
  ScheduleSessionEvent,
  ScheduleSessionAddedEvent,
} from '../schedule-sessions/schedule-sessions.event';
import { StreakAddedEvent, StreakEvent } from '../streaks/streaks.event';
import { HLPPointsDonatedEvent, UserEvent } from '../users/user.event';
import {
  ChannelFollowedEvent,
  ChannelPostAddedEvent,
  PostReactionAddedEvent,
  ChannelsEvent,
  PostThankYouEvent,
} from '../channels/channels.event';
import {
  TrophiesAchievedEvent,
  TrophiesEvent,
} from '../trophies/trophies.events';
import {
  CheckinEvent,
  UserCheckinLevelSavedEvent,
} from '../checkins/checkins.events';
import {
  BlogPostsEvent,
  UserBlogReadSavedEvent,
} from '../blog-posts/blog-posts.event';
import { RewardsQueue } from './rewards.queue';
import {
  AdminPostEvent,
  AdminPostReadEvent,
} from '../admin-post-reads/admin-post-reads.event';
import {
  UserMoodCheckSavedEvent,
  UserMoodChecksEvent,
} from '../user-mood-checks/user-mood-checks.event';
import { FormsEvent, UserFormAnswerEvent } from '../forms/forms.event';
import { RewardsService } from './rewards.service';
import { UserRoles } from '@users/users.dto';

@Injectable()
export class RewardsEventListener {
  private readonly logger = new Logger(RewardsEventListener.name);
  constructor(
    private readonly rewardsQueue: RewardsQueue,
    private readonly rewardsService: RewardsService,
  ) {}

  @OnEvent(ScheduleSessionEvent.SESSION_ADDED)
  async handleScheduleSessionAddedEvent(
    payload: ScheduleSessionAddedEvent,
  ): Promise<void> {
    const { scheduleSession } = payload;
    if (scheduleSession.tool_kit_id) {
      await this.rewardsQueue.addToolkitReward(scheduleSession);
    }
    if (scheduleSession.user_toolkit_id) {
      await this.rewardsQueue.addUserToolkitReward(scheduleSession);
    }
  }

  @OnEvent(StreakEvent.STREAK_ADDED)
  async handleStreakAddedEvent(payload: StreakAddedEvent): Promise<void> {
    const { streak } = payload;
    await this.rewardsQueue.addStreakReward(streak);
  }

  @OnEvent(MembershipStagesEvent.MEMBERSHIP_STAGE_SAVED)
  async handleMembershipStagedSavedEvent(
    payload: MembershipStageSavedEvent,
  ): Promise<void> {
    this.logger.log(`Add membership stage reward ${JSON.stringify(payload)}`);
    await this.rewardsQueue.addStageReward(payload.userMembershipStage);
  }

  @OnEvent(MembershipLevelsEvent.MEMBERSHIP_LEVEL_SAVED)
  async handleMembershipLevelSavedEvent(
    payload: MembershipLevelSavedEvent,
  ): Promise<void> {
    this.logger.log(`Add membership level reward ${JSON.stringify(payload)}`);
    await this.rewardsQueue.addLevelReward(payload.userMembershipLevel);
  }

  @OnEvent(ChallengesEvent.GOAL_COMPLETED)
  async handleChallengeGoalCompletedEvent(
    payload: ChallengeGoalCompletedEvent,
  ): Promise<void> {
    const { userChallenge } = payload;
    this.logger.log(`Add challenge gol reward ${JSON.stringify(payload)}`);
    await this.rewardsQueue.addChallengeGoalCompletionReward(userChallenge);
  }

  @OnEvent(ChallengesEvent.WON)
  async handleChallengeWonEvent(payload: ChallengeWonEvent): Promise<void> {
    this.logger.log(
      `Add challenge completed reward ${JSON.stringify(payload)}`,
    );
    await this.rewardsQueue.addChallengeWonReward(payload);
  }

  @OnEvent(BonusesEvent.BONUS_CLAIMED)
  async handleBonusClaimedEvent(payload: BonusClaimedEvent): Promise<void> {
    await this.rewardsQueue.addBonusClaimedReward(payload.userBonus);
  }
  @OnEvent(UserEvent.HLP_POINTS_DONATED)
  async handleHLPPointsDonatedEvent(
    payload: HLPPointsDonatedEvent,
  ): Promise<void> {
    this.logger.log(`Add donation reward ${JSON.stringify(payload)}`);
    await this.rewardsQueue.addDonationReward(payload.donation);
  }

  @OnEvent(GoalsEvent.GOAL_LEVEL_SAVED)
  async handleGoalLevelSavedEvent(
    payload: GoalsLevelSavedEvent,
  ): Promise<void> {
    this.logger.log(`Add Goal level reward ${JSON.stringify(payload)}`);
    await this.rewardsQueue.addGoalLevelReward(payload.userGoalLevel);
  }

  @OnEvent(ChannelsEvent.CHANNEL_FOLLOWED)
  async handleChannelFollowedEvent(
    payload: ChannelFollowedEvent,
  ): Promise<void> {
    const { userChannel } = payload;

    const channel = await this.rewardsService.getChannel(
      userChannel.channel_id,
    );
    if (channel.is_private) {
      this.logger.warn(`Rewards not availabe for private groups`);
      return;
    }

    this.logger.log(`Add channel followed reward ${JSON.stringify(payload)}`);
    await this.rewardsQueue.addChannelFollowedReward(userChannel);
  }

  @OnEvent(ChannelsEvent.CHANNEL_POST_ADDED)
  async handleChannelPostAddedEvent(
    payload: ChannelPostAddedEvent,
  ): Promise<void> {
    this.logger.log(`Add channel Post added reward ${JSON.stringify(payload)}`);
    await this.rewardsQueue.addChannelPostAddedReward(payload.channelPost);
  }

  @OnEvent(ChannelsEvent.CHANNEL_POST_REACTION_ADDED)
  async handleChannelPostReactionEvent(
    payload: PostReactionAddedEvent,
  ): Promise<void> {
    this.logger.log(
      `Add channel post reaction reward ${JSON.stringify(payload)}`,
    );
    const { user_id } = payload.channelPostReaction;
    const user = await this.rewardsService.getUserById(user_id);
    if (user.role === UserRoles.DOCTOR) {
      this.logger.log(`Reward not added`);
      return;
    }
    await this.rewardsQueue.addChannelPostReactionReward(
      payload.channelPostReaction,
    );
  }

  @OnEvent(TrophiesEvent.TROPHIES_ACHIVED)
  async handleTrophiesAchievedEvent(
    payload: TrophiesAchievedEvent,
  ): Promise<void> {
    this.logger.log(`Add Trophies Achieved reward ${JSON.stringify(payload)}`);
    await this.rewardsQueue.addTrophiesAchievedReward(payload.userTrophy);
  }

  @OnEvent(CheckinEvent.USER_CHECKIN_LEVEL_SAVED)
  async handleCheckinLevelEvent(
    payload: UserCheckinLevelSavedEvent,
  ): Promise<void> {
    this.logger.log(`Add Checkin Level reward ${JSON.stringify(payload)}`);
    await this.rewardsQueue.addCheckinLevelReward(payload.userCheckinLevel);
  }

  @OnEvent(BlogPostsEvent.USER_BLOG_READ_SAVED)
  async handleUserBlogReadSavedEvent(
    payload: UserBlogReadSavedEvent,
  ): Promise<void> {
    await this.rewardsQueue.addUserBlogReadReward(payload.userBlogRead);
    this.logger.log(`Add blog read reward ${payload.userBlogRead}`);
  }

  @OnEvent(ChannelsEvent.CHANNEL_POST_THANK_YOU)
  async handlePostThankYouEvent(payload: PostThankYouEvent): Promise<void> {
    this.logger.log(
      `Add channel Post Thank You reward ${JSON.stringify(payload)}`,
    );
    await this.rewardsQueue.addChannelPostThankYouReward(payload);
  }

  @OnEvent(AdminPostEvent.POST_READ)
  async handleAdminPostReadSavedEvent(
    payload: AdminPostReadEvent,
  ): Promise<void> {
    await this.rewardsQueue.addAdminPostReadReward(payload.adminPostRead);
    this.logger.log(`Add post read reward ${payload.adminPostRead}`);
  }

  @OnEvent(UserMoodChecksEvent.MOOD_CHECK_SAVED)
  async handleUserMoodCheckSavedEvent(
    payload: UserMoodCheckSavedEvent,
  ): Promise<void> {
    await this.rewardsQueue.addUserMoodCheckReward(payload.userMoodCheck);
    this.logger.log(`Add user mood check reward ${payload.userMoodCheck}`);
  }
  @OnEvent(FormsEvent.USER_FORM_ANSWER_ADDED)
  async handleUserFormAnswerEvent(payload: UserFormAnswerEvent): Promise<void> {
    this.logger.log(`Add membership level reward ${JSON.stringify(payload)}`);
    await this.rewardsQueue.addUserReward(payload.userFormAnswer);
  }
}
