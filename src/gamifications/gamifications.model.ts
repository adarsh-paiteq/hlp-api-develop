import {
  ArgsType,
  createUnionType,
  Field,
  ObjectType,
  PickType,
  registerEnumType,
} from '@nestjs/graphql';
import { IsUUID, IsOptional } from 'class-validator';
import { Challenge } from '../challenges/challenges.model';
import { GoalLevel } from '../goals/goals.model';
import { MembershipStage } from '../membership-stages/membership-stages.model';
import { ToolkitStreak } from '../streaks/streaks.model';
import { MembershipLevel } from '../membership-levels/entities/membership-level.entity';
import { Trophy } from '../trophies/entities/trophy.entity';
import { i18nValidationMessage } from '@core/modules/i18n-next';

export enum GamificationType {
  GOAL_LEVEL = 'GOAL_LEVEL',
  TROPHY = 'TROPHY',
  TOOLKIT_STREAK = 'TOOLKIT_STREAK',
  MEMBERSHIP_STAGE = 'MEMBERSHIP_STAGE',
  MEMBERSHIP_LEVEL = 'MEMBERSHIP_LEVEL',
  CHALLENGE_WON = 'CHALLENGE_WON',
  CHALLENGE_GOAL = 'CHALLENGE_GOAL',
}

registerEnumType(GamificationType, { name: 'GamificationType' });

export class Gamification {
  id: string;
  type: GamificationType;
  goal_level_id: string;
  membership_level_id: string;
  membership_stage_id: string;
  toolkit_streak_id: string;
  trophy_id: string;
  challenge_id: string;
  showed: boolean;
  created_at: string;
  updated_at: string;
}

@ObjectType()
export class GamificationToolkitStreakTotal extends PickType(ToolkitStreak, [
  'streak_count',
]) {
  is_completed: boolean;
}
@ObjectType()
export class GamificationToolkitStreak extends ToolkitStreak {
  @Field(() => [GamificationToolkitStreakTotal])
  total_streaks: Array<GamificationToolkitStreakTotal>;
}

@ObjectType()
export class GamificationGoalLevel extends GoalLevel {
  goal_title: string;
}

export type GamificationData =
  | MembershipLevel
  | MembershipStage
  | GamificationGoalLevel
  | GamificationToolkitStreak
  | Trophy
  | Challenge;

const GamificationData = createUnionType({
  name: 'GamificationData',
  types: () => [
    MembershipLevel,
    MembershipStage,
    GamificationGoalLevel,
    GamificationToolkitStreak,
    Trophy,
    Challenge,
  ],
  resolveType: (value) => {
    if ('challenge_start_date' in value) {
      return Challenge;
    }
    if ('hlp_reward_points_to_unlock_this_stage' in value) {
      return MembershipStage;
    }
    if ('hlp_reward_points_to_complete_goal' in value) {
      return GamificationGoalLevel;
    }
    if ('streak_count' in value) {
      return GamificationToolkitStreak;
    }
    if ('trophy_type' in value) {
      return Trophy;
    }
    return MembershipLevel;
  },
});

@ObjectType()
export class GamificationResponse {
  next: boolean;
  available: boolean;
  type?: GamificationType;
  id?: string;
  @Field(() => GamificationData, { nullable: true })
  data?: GamificationData;
}

export const GamificationDataTables = new Map<string, string>([
  [GamificationType.MEMBERSHIP_LEVEL, 'membership_levels'],
  [GamificationType.MEMBERSHIP_STAGE, 'membership_stages'],
  [GamificationType.TROPHY, 'trophies'],
  [GamificationType.CHALLENGE_GOAL, 'challenges'],
  [GamificationType.CHALLENGE_WON, 'challenges'],
]);

@ArgsType()
export class UpdateGamificationStatusArgs {
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  id: string;
}

@ObjectType()
export class UpdateGamificationStatusResponse {
  message: string;
}

export class CreatedGamificationStatusResponse {
  message: string;
}
export class TestCreateGamificationArgs {
  @IsOptional()
  @IsUUID()
  goal_level_id: string;

  @IsOptional()
  @IsUUID()
  membership_level_id: string;

  @IsOptional()
  @IsUUID()
  toolkit_streak_id: string;

  @IsOptional()
  @IsUUID()
  trophy_id: string;

  @IsOptional()
  @IsUUID()
  membership_stage_id: string;

  @IsUUID()
  user_Id: string;
}
