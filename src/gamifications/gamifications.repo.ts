import { Injectable } from '@nestjs/common';
import { Database } from '../core/modules/database/database.service';
import { ToolkitStreak } from '../streaks/streaks.model';
import {
  Gamification,
  GamificationGoalLevel,
  GamificationToolkitStreakTotal,
  GamificationType,
} from './gamifications.model';

@Injectable()
export class GamificationsRepo {
  constructor(private readonly database: Database) {}

  async getActiveGamifications(userId: string): Promise<Gamification[]> {
    const query = `SELECT * FROM gamifications WHERE user_id=$1 AND showed=false ORDER By created_at ASC`;
    const gamifications = await this.database.query<Gamification>(query, [
      userId,
    ]);
    return gamifications;
  }

  async getGamificationData<T>(id: string, tableName: string): Promise<T> {
    const query = `SELECT * FROM ${tableName} WHERE id=$1`;
    const [membershipLevel] = await this.database.query<T>(query, [id]);
    return membershipLevel;
  }

  async updateGamificationStatus(
    id: string,
    userId: string,
  ): Promise<Gamification> {
    const query = `UPDATE gamifications SET showed=true WHERE id=$1 AND user_id=$2 RETURNING *`;
    const [gamification] = await this.database.query<Gamification>(query, [
      id,
      userId,
    ]);
    return gamification;
  }

  async getGamification(id: string, userId: string): Promise<Gamification> {
    const query = `SELECT * FROM gamifications WHERE id=$1 AND user_id=$2`;
    const [gamification] = await this.database.query<Gamification>(query, [
      id,
      userId,
    ]);
    return gamification;
  }

  async getGamificationToolkitStreak(id: string): Promise<ToolkitStreak> {
    const query = `SELECT * FROM toolkit_streaks WHERE id=$1`;
    const [toolkitStreak] = await this.database.query<ToolkitStreak>(query, [
      id,
    ]);
    return toolkitStreak;
  }

  async getToolkitStreaks(
    toolkitId: string,
    userId: string,
  ): Promise<GamificationToolkitStreakTotal[]> {
    const query = `SELECT streak_count,
    CASE
    WHEN user_streaks.streak_id=toolkit_streaks.id THEN true ELSE false
    END AS is_completed FROM toolkit_streaks
    LEFT JOIN user_streaks ON user_streaks.streak_id=toolKit_streaks.id AND user_streaks.user_id=$2
    WHERE toolkit_streaks.tool_kit=$1
    ORDER By toolkit_streaks.streak_count ASC`;
    const data = await this.database.query<GamificationToolkitStreakTotal>(
      query,
      [toolkitId, userId],
    );
    return data;
  }
  async getGamificationGoalLevel(id: string): Promise<GamificationGoalLevel> {
    const query = `SELECT goal_levels.*,goals.title AS goal_title FROM goal_levels
    INNER JOIN goals ON goal_levels.goal_id=goals.id
    WHERE goal_levels.id=$1`;
    const [goalLevel] = await this.database.query<GamificationGoalLevel>(
      query,
      [id],
    );
    return goalLevel;
  }

  async createGoalGamification(
    user_id: string,
    goal_level_id: string,
  ): Promise<Gamification[]> {
    const gamificationType = GamificationType.GOAL_LEVEL;

    const query = `INSERT INTO gamifications(user_id, goal_level_id, type  )
                   values($1, $2, $3)`;

    const gamification = await this.database.query<Gamification>(query, [
      user_id,
      goal_level_id,
      gamificationType,
    ]);
    return gamification;
  }

  async checkGoalGamification(
    user_id: string,
    goal_level_id: string,
  ): Promise<Gamification> {
    const query = `SELECT * FROM gamifications WHERE user_id = $1 AND goal_level_id = $2`;
    const [gamification] = await this.database.query<Gamification>(query, [
      user_id,
      goal_level_id,
    ]);
    return gamification;
  }

  async checkMembershipGamification(
    user_id: string,
    membership_level_id: string,
  ): Promise<Gamification> {
    const query = `SELECT * FROM gamifications WHERE user_id = $1 AND membership_level_id = $2`;
    const [gamification] = await this.database.query<Gamification>(query, [
      user_id,
      membership_level_id,
    ]);
    return gamification;
  }

  async createMembershipGamification(
    user_id: string,
    membership_level_id: string,
  ): Promise<Gamification[]> {
    const gamificationType = GamificationType.MEMBERSHIP_LEVEL;

    const query = `INSERT INTO gamifications(user_id, membership_level_id, type  )
                   values($1, $2, $3)`;

    const gamification = await this.database.query<Gamification>(query, [
      user_id,
      membership_level_id,
      gamificationType,
    ]);
    return gamification;
  }

  async checkStreakGamification(
    user_id: string,
    streak_id: string,
  ): Promise<Gamification> {
    const query = `SELECT * FROM gamifications WHERE user_id = $1 AND toolkit_streak_id = $2`;
    const [gamification] = await this.database.query<Gamification>(query, [
      user_id,
      streak_id,
    ]);
    return gamification;
  }

  async createStreakGamification(
    user_id: string,
    toolkit_streak_id: string,
  ): Promise<Gamification[]> {
    const gamificationType = GamificationType.TOOLKIT_STREAK;

    const query = `INSERT INTO gamifications(user_id, toolkit_streak_id, type  )
                   values($1, $2, $3)`;

    const gamification = await this.database.query<Gamification>(query, [
      user_id,
      toolkit_streak_id,
      gamificationType,
    ]);
    return gamification;
  }

  async checkmembershipStageGamification(
    user_id: string,
    membership_stage_id: string,
  ): Promise<Gamification> {
    const query = `SELECT * FROM gamifications WHERE user_id = $1 AND membership_stage_id = $2`;
    const [gamification] = await this.database.query<Gamification>(query, [
      user_id,
      membership_stage_id,
    ]);
    return gamification;
  }

  async createMembershipStageGamification(
    user_id: string,
    membership_stage_id: string,
  ): Promise<Gamification[]> {
    const gamificationType = GamificationType.MEMBERSHIP_STAGE;

    const query = `INSERT INTO gamifications(user_id, membership_stage_id, type  )
                   values($1, $2, $3)`;

    const gamification = await this.database.query<Gamification>(query, [
      user_id,
      membership_stage_id,
      gamificationType,
    ]);
    return gamification;
  }

  async checkTrophyGamification(
    user_id: string,
    trophy_id: string,
  ): Promise<Gamification> {
    const query = `SELECT * FROM gamifications WHERE user_id = $1 AND trophy_id = $2`;
    const [gamification] = await this.database.query<Gamification>(query, [
      user_id,
      trophy_id,
    ]);
    return gamification;
  }

  async createTrophyGamification(
    user_id: string,
    trophy_id: string,
  ): Promise<Gamification[]> {
    const gamificationType = GamificationType.TROPHY;

    const query = `INSERT INTO gamifications(user_id, trophy_id, type  )
                   values($1, $2, $3)`;

    const gamification = await this.database.query<Gamification>(query, [
      user_id,
      trophy_id,
      gamificationType,
    ]);
    return gamification;
  }
}
