import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  MembershipLevelSavedEvent,
  MembershipLevelsEvent,
} from '../membership-levels/membership-levels.event';
import {
  ChallengeGoalCompletedEvent,
  ChallengesEvent,
  ChallengeWonEvent,
} from '../challenges/challenges.event';
import { StreakAddedEvent, StreakEvent } from '../streaks/streaks.event';
import { TrophyType } from './trophies.dto';
import { TrophiesQueue } from './trophies.queue';
import {
  FriendFollowedEvent,
  HLPPointsDonatedEvent,
  UserEvent,
} from '../users/user.event';
import {
  ChannelFollowedEvent,
  ChannelPostAddedEvent,
  PostReactionAddedEvent,
  ChannelsEvent,
} from '../channels/channels.event';
import {
  ScheduleSessionAddedEvent,
  ScheduleSessionEvent,
} from '../schedule-sessions/schedule-sessions.event';
import { ToolkitRepo } from '../toolkits/toolkit.repo';
import { TrophiesService } from './trophies.service';
import { UserRoles } from '@users/users.dto';

@Injectable()
export class TrophiesEventListener {
  private readonly logger = new Logger(TrophiesEventListener.name);

  constructor(
    private readonly trophiesQueue: TrophiesQueue,
    private readonly toolkitRepo: ToolkitRepo,
    private readonly trophiesService: TrophiesService,
  ) {}

  @OnEvent(StreakEvent.STREAK_ADDED)
  async handleStreakAddedEvent(payload: StreakAddedEvent): Promise<void> {
    this.logger.log(`checking for ${TrophyType.STREAK} Trophy`);
    const { streak } = payload;
    await this.trophiesQueue.checkTrophiesAchieved({
      user_id: streak.user_id,
      trophy_type: TrophyType.STREAK,
    });
  }
  @OnEvent(ChallengesEvent.GOAL_COMPLETED)
  async handleChallengeGoalCompletedEvent(
    payload: ChallengeGoalCompletedEvent,
  ): Promise<void> {
    const {
      userChallenge: { user_id },
    } = payload;
    await this.trophiesQueue.checkTrophiesAchieved({
      user_id: user_id,
      trophy_type: TrophyType.CHALLENGES_DONE,
    });
  }

  @OnEvent(ChallengesEvent.WON)
  async handleChallengeWonEvent(payload: ChallengeWonEvent): Promise<void> {
    const {
      userChallenge: { user_id },
    } = payload;
    await this.trophiesQueue.checkTrophiesAchieved({
      user_id: user_id,
      trophy_type: TrophyType.CHALLENGES_WON,
    });
  }

  @OnEvent(MembershipLevelsEvent.MEMBERSHIP_LEVEL_SAVED)
  async handleMembershipLevelSavedEvent(
    payload: MembershipLevelSavedEvent,
  ): Promise<void> {
    const { user_id } = payload.userMembershipLevel;
    await this.trophiesQueue.checkTrophiesAchieved({
      user_id: user_id,
      trophy_type: TrophyType.LEVEL,
    });
  }

  @OnEvent(ChannelsEvent.CHANNEL_POST_REACTION_ADDED)
  async handleChannelPostReactionEvent(
    payload: PostReactionAddedEvent,
  ): Promise<void> {
    const { user_id } = payload.channelPostReaction;
    const user = await this.toolkitRepo.getUserById(user_id);
    if (user.role === UserRoles.DOCTOR) {
      this.logger.log(`Trophies not added`);
      return;
    }
    await this.trophiesQueue.checkTrophiesAchieved({
      user_id: user_id,
      trophy_type: TrophyType.REACTIONS_ADDED,
    });
  }
  @OnEvent(ChannelsEvent.CHANNEL_POST_ADDED)
  async handleChannelPostAddedEvent(
    payload: ChannelPostAddedEvent,
  ): Promise<void> {
    const { user_id } = payload.channelPost;
    await this.trophiesQueue.checkTrophiesAchieved({
      user_id: user_id,
      trophy_type: TrophyType.POSTS_ADDED,
    });
  }

  @OnEvent(ChannelsEvent.CHANNEL_FOLLOWED)
  async handleChannelFollowedEvent(
    payload: ChannelFollowedEvent,
  ): Promise<void> {
    const { user_id, channel_id } = payload.userChannel;
    const channel = await this.trophiesService.getChannel(channel_id);
    if (channel.is_private) {
      this.logger.warn(`Trophies not availabe for private groups`);
      return;
    }
    await this.trophiesQueue.checkTrophiesAchieved({
      user_id: user_id,
      trophy_type: TrophyType.CHANNEL_FOLLOW,
    });
  }

  @OnEvent(ScheduleSessionEvent.SESSION_ADDED)
  async handleScheduleSessionAddedEvent(
    payload: ScheduleSessionAddedEvent,
  ): Promise<void> {
    const { user_id } = payload.scheduleSession;
    await this.trophiesQueue.checkTrophiesAchieved({
      user_id: user_id,
      trophy_type: TrophyType.TOOLS_DONE,
    });
  }

  /**
   * @description check if user has achieved Trophy Type: HLP_DONATED
   */
  @OnEvent(UserEvent.HLP_POINTS_DONATED)
  async handleHLPPointsDonatedEvent(
    payload: HLPPointsDonatedEvent,
  ): Promise<void> {
    const { donor_user_id } = payload.donation;
    await this.trophiesQueue.checkTrophiesAchieved({
      user_id: donor_user_id,
      trophy_type: TrophyType.HLP_DONATED,
    });
  }

  /**
   * @description check if user has achieved Trophy Type: HELPED
   */
  @OnEvent(UserEvent.HLP_POINTS_DONATED)
  async handleHELPEDEvent(payload: HLPPointsDonatedEvent): Promise<void> {
    const { donor_user_id } = payload.donation;
    await this.trophiesQueue.checkTrophiesAchieved({
      user_id: donor_user_id,
      trophy_type: TrophyType.HELPED,
    });
  }

  /**`
   * @description check if user has achieved Trophy Type: HLP_EARNED
   */
  @OnEvent(UserEvent.HLP_POINTS_DONATED)
  async handleHLPPointsEarnedEvent(
    payload: HLPPointsDonatedEvent,
  ): Promise<void> {
    const { receiver_user_id } = payload.donation;
    await this.trophiesQueue.checkTrophiesAchieved({
      user_id: receiver_user_id,
      trophy_type: TrophyType.HLP_EARNED,
    });
  }

  /**
   * @description check if user has achieved Trophy Type: HLP_RECIEVED
   */
  @OnEvent(UserEvent.HLP_POINTS_DONATED)
  async handleHLPPointsRecievedEvent(
    payload: HLPPointsDonatedEvent,
  ): Promise<void> {
    const { receiver_user_id } = payload.donation;
    await this.trophiesQueue.checkTrophiesAchieved({
      user_id: receiver_user_id,
      trophy_type: TrophyType.HLP_RECIEVED,
    });
  }

  @OnEvent(ScheduleSessionEvent.SESSION_ADDED)
  async handleCheckInEvent(payload: ScheduleSessionAddedEvent): Promise<void> {
    const { user_id, checkin_id } = payload.scheduleSession;
    if (!checkin_id) {
      this.logger.log(`checkin_id not found`);
      return;
    }
    await this.trophiesQueue.checkTrophiesAchieved({
      user_id: user_id,
      trophy_type: TrophyType.CHECK_INS_DONE,
    });
  }

  @OnEvent(ScheduleSessionEvent.SESSION_ADDED)
  async handleMeditationTookkitEvent(
    payload: ScheduleSessionAddedEvent,
  ): Promise<void> {
    const { user_id, tool_kit_id } = payload.scheduleSession;
    if (!tool_kit_id) {
      return;
    }
    const { meditation_tool_kit } =
      await this.toolkitRepo.getMeditationToolkitData(tool_kit_id);
    if (meditation_tool_kit.length) {
      await this.trophiesQueue.checkTrophiesAchieved({
        user_id: user_id,
        trophy_type: TrophyType.MEDITATION_TOOLS_DONE,
      });
    }
  }

  @OnEvent(UserEvent.FRIEND_FOLLOWED)
  async handleFriendFollowedEvent(payload: FriendFollowedEvent): Promise<void> {
    const { user_id } = payload.friendFollowed;
    await this.trophiesQueue.checkTrophiesAchieved({
      user_id: user_id,
      trophy_type: TrophyType.FRIENDS_FOLLOW,
    });
  }
}
