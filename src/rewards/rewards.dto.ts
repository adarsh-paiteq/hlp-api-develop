import { PickType } from '@nestjs/mapped-types';
import { Expose } from 'class-transformer';
import { IsUUID } from 'class-validator';
import { UserCheckinLevel } from '../checkins/checkins.dto';
import { ChannelPostReaction } from '../channels/channels.dto';
import { ToolKitByToolKit } from '../schedules/schedules.dto';
import { UserStreak } from '../streaks/streaks.dto';
import { UserTrophy } from '../trophies/trophies.dto';
import { UserRewards } from './entities/user-rewards.entity';
import { Toolkit, ToolkitType } from '../toolkits/toolkits.model';
import { HideField } from '@nestjs/graphql';
import { Translation } from '@utils/utils.dto';

export enum RewardType {
  TOOL_KIT = 'TOOL_KIT',
  STREAK = 'STREAK',
  LEVEL_COMPLETION = 'LEVEL_COMPLETION',
  TROPHY = 'TROPHY',
  MEMBER_STAGE = 'MEMBER_STAGE',
  CHALLENGE = 'CHALLENGE',
  HLP_DONATION = 'HLP_DONATION',
  GOAL_LEVEL = 'GOAL_LEVEL',
  FOLLOW_CHANNEL = 'FOLLOW_CHANNEL',
  CHANNEL_POST = 'CHANNEL_POST',
  CHANNEL_POST_REACTION = 'CHANNEL_POST_REACTION',
  CHANNEL_POST_REACTION_REPLY = 'CHANNEL_POST_REACTION_REPLY',
  CHECKIN_LEVEL = 'CHECKIN_LEVEL',
  BLOG_READ = 'BLOG_READ',
  BONUS_CLAIMED = 'BONUS',
  CHALLENGE_GOAL_COMPLETION = 'CHALLENGE_GOAL_COMPLETION',
  CHANNEL_POST_THANK_YOU = 'CHANNEL_POST_THANK_YOU',
  CHALLENGE_WON = 'CHALLENGE_WON',
  ADMIN_CHANNEL_POST = 'ADMIN_CHANNEL_POST',
  MOOD_CHECK = 'MOOD_CHECK',
  FORM = 'FORM',
  USER_TOOLKIT = 'USER_TOOLKIT',
}

export class ToolKitReward extends PickType(UserRewards, [
  'user_id',
  'tool_kit_id',
  'hlp_reward_points_awarded',
  'reward_type',
  'title',
] as const) {
  translations: Translation;
}

export class UserToolKitReward extends PickType(UserRewards, [
  'user_id',
  'user_toolkit_id',
  'hlp_reward_points_awarded',
  'reward_type',
  'title',
  'translations',
] as const) {}

export class ToolKit extends ToolKitByToolKit {
  tool_kit_hlp_reward_points: number;
  title: string;
  id: string;
  is_completed?: boolean;
  tool_kit_category: string;
  drink_water_tool_kit_answers: unknown[];
  running_tool_kit_answers: unknown[];
  video_tool_kit_answers: unknown[];
  sleep_check_tool_kit_answers: unknown[];
  tool_kit_type: ToolkitType;

  [key: string]: unknown;
}

export class BaseToolKitAnswer {
  id: string;
  schedule_id: string;
  session_time: string;
  session_date: string;
  [key: string]: unknown;
}

export class SleepcheckToolkitAnswer extends BaseToolKitAnswer {}

/**
 * @description The @function addToolKitIdReward()  functions in the rewards controller utilizes DTOs
 */
export class AddToolKitRewardDto {
  @IsUUID()
  userId: string;
  @IsUUID()
  toolKitId: string;
}

export class UserReward extends PickType(UserRewards, [
  'user_id',
  'hlp_reward_points_awarded',
]) {}

export class StreakReward extends PickType(UserRewards, [
  'user_id',
  'tool_kit_id',
  'hlp_reward_points_awarded',
  'reward_type',
  'streak_id',
  'title',
  'translations',
] as const) {}

export type RewardInput = ToolKitReward | StreakReward | UserFormAnswerReward;

/**
 * @description The @function addStreakReward()  functions in the rewards controller utilizes DTOs
 */
export class AddStreakRewardDto extends UserStreak {
  @Expose({ name: 'userId' })
  @IsUUID()
  user_id: string;

  @Expose({ name: 'streakId' })
  @IsUUID()
  streak_id: string;
}

export class MembershipStageReward extends PickType(UserRewards, [
  'user_id',
  'membership_stage_id',
  'reward_type',
  'hlp_reward_points_awarded',
  'title',
  'translations',
]) {}

/**
 * @description The @function addStageReward()  functions in the rewards controller and @function addMembershipStageReward() functions in the rewards services  utilizes DTOs
 */
export class AddMembershipStageRewardDto {
  @Expose({ name: 'userId' })
  @IsUUID()
  user_id: string;

  @Expose({ name: 'membershipStageId' })
  @IsUUID()
  membership_stage_id: string;
}

/**
 * @description The @function addLevelReward()  functions in the rewards controller and @function addMembershipLevelReward() functions in the rewards services  utilizes DTOs
 */
export class AddMembershipLevelRewardDto {
  @Expose({ name: 'userId' })
  @IsUUID()
  user_id: string;

  @Expose({ name: 'membershipLevelId' })
  @IsUUID()
  membership_level_id: string;
}

export class MembershipLevelReward extends PickType(UserRewards, [
  'user_id',
  'membership_level_id',
  'reward_type',
  'hlp_reward_points_awarded',
  'title',
  'translations',
]) {}

export class UserBalance {
  earned: number;
  received: number;
  total: number;
}
export class GetUserBalance {
  earned: number;
}

export class UserDonationReward extends PickType(UserRewards, [
  'user_id',
  'reward_type',
  'hlp_reward_points_awarded',
  'user_donation_id',
  'title',
]) {
  translations: Translation;
}

export class ChannelFollowedReward extends PickType(UserRewards, [
  'user_id',
  'channel_id',
  'reward_type',
  'hlp_reward_points_awarded',
  'title',
  'translations',
]) {}

export class GoalLevelReward extends PickType(UserRewards, [
  'user_id',
  'goal_level_id',
  'reward_type',
  'hlp_reward_points_awarded',
  'title',
  'translations',
]) {}

export class ChannelPostReward extends PickType(UserRewards, [
  'user_id',
  'channel_post_id',
  'reward_type',
  'hlp_reward_points_awarded',
  'title',
  'channel_id',
  'translations',
]) {}

export class ChannelPostReactionReward extends PickType(UserRewards, [
  'user_id',
  'post_reaction_id',
  'reward_type',
  'hlp_reward_points_awarded',
  'title',
  'translations',
]) {}

export class TrophyAchievedReward extends PickType(UserRewards, [
  'user_id',
  'trophy_id',
  'reward_type',
  'hlp_reward_points_awarded',
  'title',
  'translations',
]) {}

export class CheckinReward extends PickType(UserRewards, [
  'user_id',
  'checkin_level_id',
  'reward_type',
  'hlp_reward_points_awarded',
  'title',
  'translations',
]) {}

export class ChannelPostThankYouReward extends PickType(UserRewards, [
  'user_id',
  'channel_post_id',
  'reward_type',
  'hlp_reward_points_awarded',
  'title',
  'translations',
]) {}

export class ChallengeWonReward extends PickType(UserRewards, [
  'user_id',
  'challenge_id',
  'reward_type',
  'hlp_reward_points_awarded',
  'title',
  'translations',
]) {}
export class BonusesReward extends PickType(UserRewards, [
  'user_id',
  'bonus_id',
  'reward_type',
  'hlp_reward_points_awarded',
  'title',
  'translations',
]) {}

export class UserMoodCheckReward extends PickType(UserRewards, [
  'user_id',
  'user_mood_check_id',
  'reward_type',
  'hlp_reward_points_awarded',
  'title',
  'translations',
]) {}
export class BlogReadReward {
  user_id: string;
  blog_id: string;
  reward_type: RewardType;
  hlp_reward_points_awarded: number;
  title: string;
  translations: Translation;
}

export class AdminPostReadReward {
  user_id: string;
  channel_post_id: string;
  reward_type: RewardType;
  hlp_reward_points_awarded: number;
  title: string;
}
export class RewardUserTrophy extends UserTrophy {
  title: string;
}

export class RewardChannelPostReaction extends ChannelPostReaction {
  channel_title: string;
}

export class RewardUserCheckinLevel extends UserCheckinLevel {
  title: string;
  hlp_reward_points_to_be_awarded: number;
  @HideField()
  translations?: Translation;
}

export class ChallengeReward extends PickType(UserRewards, [
  'user_id',
  'challenge_id',
  'reward_type',
  'hlp_reward_points_awarded',
  'title',
  'translations',
]) {}
export class UserFormAnswerReward extends PickType(UserRewards, [
  'user_id',
  'form_id',
  'tool_kit_id',
  'reward_type',
  'hlp_reward_points_awarded',
  'title',
  'translations',
]) {}

export class ToolkitStreakWithToolkitDto {
  id: string;
  tool_kit: string;
  streak_count: number;
  streak_points: number;
  sequence_number?: number;
  toolkit: Toolkit;
}
