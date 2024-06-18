import { IsUUID } from 'class-validator';

export class ToolkitStreak {
  id: string;
  tool_kit: string;
  toolKitByToolKit: ToolKitByToolKit;
  streak_count: number;
  streak_points: number;
  created_at: string;
  updated_at: string;
  sequence_number: number;

  // custom
  isCompleted?: boolean;
}

export class ToolKitByToolKit {
  title: string;
}

export class UserStreak {
  id?: string;
  tool_kit_id: string;
  streak_id: string;
  user_id: string;
  updated_at?: string;
  created_at?: string;
}

/**
 * @description The @function getUserTookitStreakHistory() function in the streaks controller uses a DTO
 */
export class GetUserTookitStreakHistoryTestQuery {
  @IsUUID()
  userId: string;

  @IsUUID()
  toolKitId: string;
}

/**
 * @description The @function addUserStreak() function in the streaks controller uses a DTO
 */
export class addUserStreak extends GetUserTookitStreakHistoryTestQuery {}
