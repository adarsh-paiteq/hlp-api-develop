import { HideField } from '@nestjs/graphql';
import { Translation } from '@utils/utils.dto';
import { IsNotEmpty } from 'class-validator';

export class Trophy {
  id: string;
  title: string;
  short_description: string;
  image_url: string;
  image_id: string;
  file_path: string;
  trophy_type: string;
  hlp_reward_points: number;
  no_of_goals_done: number;
  no_of_levels_done: number;
  no_of_donations: number;
  hlps_received: number;
  streaks: number;
  hlps_won: number;
  challenges_won: number;
  challenges_done: number;
  posts_added: number;
  reactions_added: number;
  check_ins_done: number;
  tools_done: number;
  meditations_done: number;
  channels_follow: number;
  friends_follow: number;
  hlps_donated: number;
  account_duration_in_years: number;
  created_at: string;
  updated_at: string;
  is_completed: boolean;
  @HideField()
  translations?: Translation;
}

export class UserTrophy {
  id: string;
  user_id: string;
  trophy_id: string;
  created_at: string;
  updated_at: string;
}

export class SaveUserTrophy {
  user_id: string;
  trophy_id: string;
}

export class ToolkitWithSessions {
  tool_kit_hlp_reward_points: number;
  user_schedule_sessions_aggregate: { aggregate: { count: number } };
}

/**
 * @description The @function getTrophiesAchieved() and @function checkGoalLevel() functions in the trophies controller use DTOs
 */
export class TrophyTypeDto {
  @IsNotEmpty()
  trophy_type: TrophyType;
}
export enum TrophyType {
  STREAK = 'STREAK',
  TOOLS_DONE = 'TOOLS_DONE',
  CHALLENGES_DONE = 'CHALLENGES_DONE',
  CHALLENGES_WON = 'CHALLENGES_WON',
  LEVEL = 'LEVEL',
  HLP_DONATED = 'HLP_DONATED',
  REACTIONS_ADDED = 'REACTIONS_ADDED',
  POSTS_ADDED = 'POSTS_ADDED',
  CHANNEL_FOLLOW = 'CHANNEL_FOLLOW',
  ACCOUNT_DURATION = 'ACCOUNT_DURATION',
  CHECK_INS_DONE = 'CHECK_INS_DONE',
  FRIENDS_FOLLOW = 'FRIENDS_FOLLOW',
  MEDITATION_TOOLS_DONE = 'MEDITATION_TOOLS_DONE',
  HLP_EARNED = 'HLP_EARNED',
  HLP_RECIEVED = 'HLP_RECIEVED',
  HELPED = 'HELPED',
  GOAL = 'GOAL',
}

export const trophiesTable = new Map<TrophyType, string>([
  [TrophyType.HLP_EARNED, 'user_rewards_aggregate'],
  [TrophyType.HELPED, 'user_donations_aggregate'],
  [TrophyType.HLP_DONATED, 'user_donations_aggregate'],
  [TrophyType.HLP_RECIEVED, 'user_donations_aggregate'],
  [TrophyType.STREAK, 'user_streaks_aggregate'],
  [TrophyType.TOOLS_DONE, 'user_schedule_sessions_aggregate'],
  [TrophyType.POSTS_ADDED, 'channel_user_posts_aggregate'],
  [TrophyType.FRIENDS_FOLLOW, 'user_friends_aggregate'],
  [TrophyType.CHECK_INS_DONE, 'user_check_ins_aggregate'],
  [TrophyType.LEVEL, 'user_membership_levels_aggregate'],
  [TrophyType.REACTIONS_ADDED, 'channel_post_reactions_aggregate'],
  [TrophyType.MEDITATION_TOOLS_DONE, 'meditation_tool_kit_answers_aggregate'],
  [TrophyType.GOAL, 'user_goals_aggregate'],
  [TrophyType.CHANNEL_FOLLOW, 'user_channels_aggregate'],
  [TrophyType.ACCOUNT_DURATION, 'users_by_pk'],
  [TrophyType.CHALLENGES_DONE, 'user_challenges_aggregate'],
  //TODO: Needs review
  [TrophyType.CHALLENGES_WON, 'user_challenges_aggregate'],
]);
export enum TrophyField {
  HLP_EARNED = 'hlps_won',
  HLP_DONATED = 'hlps_donated',
  HLP_RECIEVED = 'hlps_received',
  HELPED = 'no_of_donations',
  STREAK = 'streaks',
  TOOLS_DONE = 'tools_done',
  CHALLENGES_DONE = 'challenges_done',
  CHALLENGES_WON = 'challenges_won',
  LEVEL = 'no_of_levels_done',
  REACTIONS_ADDED = 'reactions_added',
  POSTS_ADDED = 'posts_added',
  CHANNEL_FOLLOW = 'channels_follow',
  ACCOUNT_DURATION = 'account_duration_in_years',
  CHECK_INS_DONE = 'check_ins_done',
  FRIENDS_FOLLOW = 'friends_follow',
  MEDITATION_TOOLS_DONE = 'meditations_done',
  GOAL = 'no_of_goals_done',
}
export const trophyFieldsTable = new Map<TrophyType, TrophyField>([
  [TrophyType.STREAK, TrophyField.STREAK],
  [TrophyType.TOOLS_DONE, TrophyField.TOOLS_DONE],
  [TrophyType.POSTS_ADDED, TrophyField.POSTS_ADDED],
  [TrophyType.FRIENDS_FOLLOW, TrophyField.FRIENDS_FOLLOW],
  [TrophyType.CHECK_INS_DONE, TrophyField.CHECK_INS_DONE],
  [TrophyType.LEVEL, TrophyField.LEVEL],
  [TrophyType.REACTIONS_ADDED, TrophyField.REACTIONS_ADDED],
  [TrophyType.MEDITATION_TOOLS_DONE, TrophyField.MEDITATION_TOOLS_DONE],
  [TrophyType.GOAL, TrophyField.GOAL],
  [TrophyType.HLP_EARNED, TrophyField.HLP_EARNED],
  [TrophyType.HLP_RECIEVED, TrophyField.HLP_RECIEVED],
  [TrophyType.HLP_DONATED, TrophyField.HLP_DONATED],
  [TrophyType.CHANNEL_FOLLOW, TrophyField.CHANNEL_FOLLOW],
  [TrophyType.HELPED, TrophyField.HELPED],
  [TrophyType.ACCOUNT_DURATION, TrophyField.ACCOUNT_DURATION],
  [TrophyType.CHALLENGES_WON, TrophyField.CHALLENGES_WON],
  [TrophyType.CHALLENGES_DONE, TrophyField.CHALLENGES_DONE],
]);

export class CheckTrophies {
  user_id: string;
  trophy_type: TrophyType;
}
