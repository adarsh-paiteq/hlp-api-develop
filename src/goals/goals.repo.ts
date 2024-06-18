import { Injectable } from '@nestjs/common';
import { gql } from 'graphql-request';
import { scheduleSessionFragment } from '../schedule-sessions/schedule-sessions.repo';
import { scheduleFragment } from '../schedules/schedules.repo';
import { Database } from '../core/modules/database/database.service';
import { HasuraService } from '../shared/services/hasura/hasura.service';
import { User } from '../users/users.dto';
import {
  GetHistoryQuery,
  Goal,
  GoalLevel,
  UserGoal,
  UserGoalDto,
  UserGoalLevel,
} from './goals.dto';

import { GolaWithUserGoal } from './goals.model';
import {
  GoalLevelWithStatus,
  GoalWithLevels,
  SaveUserGoalLevel,
} from './dto/goal-levels.dto';
import { GoalInfo } from './entities/goal-info.entity';
import { Toolkit } from '../toolkits/toolkits.model';
import { Goal as GoalEntity } from './entities/goal.entity';
import { GetGoalHistory } from './dto/get-goal-history.dto';
import { Onboarding, OnboardingScreen } from '../users/users.model';
import { GoalCategoriesWithGoals } from './dto/get-goal-categories-with-goals.dto';

/**
 * @deprecated Fragment is used in the @function getGoalLevelsQuery() function of the schedules repository, but it is currently unused code.
 and @function getGoalLevelsQuery() function of the goals repository, its's migrated to getGoalLevels
 */
export const userGoalLevelFragment = gql`
  fragment user_goal_Level on user_goal_levels {
    id
    user_id
    goal_level_id
    created_at
    updated_at
  }
`;

/**
 * @deprecated Fragment is used in the @function getGoalLevelsQuery() function of the schedules repository, but it is currently unused code.
 and @function getGoalLevelsQuery() function of the goals repository, its's migrated to getGoalLevels
 */
export const goalLevelFragment = gql`
  fragment goal_level on goal_levels {
    id
    title
    short_description
    goal_id
    hlp_reward_points_to_complete_goal
    hlp_reward_points_to_be_awarded
    sequence_number
    created_at
    updated_at
    color
  }
`;

/**
 *@deprecated This fragment is used in  @function getGoalLevelsQuery() function of the goals repository, its's migrated to getGoalLevels.
 */
const goalFragment = gql`
  fragment goal on goals {
    id
    title
    avatar
    emoji_image_url
    emoji_image_id
    emoji_image_file_path
  }
`;

/**
 *@deprecated This fragment is used in  @function getGoalLevelsQuery() function of the goals repository, its's migrated to getGoalLevels.
 */
const userGoalFragment = gql`
  fragment user_goal on user_goals {
    id
  }
`;

@Injectable()
export class GoalsRepo {
  constructor(
    private readonly client: HasuraService,
    private readonly database: Database,
  ) {}

  /**
   *@deprecated its's migrated to getGoalLevels,this Repo used in @function getGoalLevels() in goals Repository.
   */
  private getGoalLevelsQuery(): string {
    const query = gql`
      query ($user_id: uuid!) {
        user_goals(
          where: { user_id: { _eq: $user_id }, is_selected: { _eq: true } }
        ) {
          ...user_goal
          goalByGoal {
            ...goal
            goal_levels(order_by: { sequence_number: asc }) {
              ...goal_level
              user_goal_levels(where: { user_id: { _eq: $user_id } }) {
                ...user_goal_Level
              }
            }
            tool_kits {
              tool_kit_hlp_reward_points
              title
              user_schedule_sessions_aggregate(
                where: { user_id: { _eq: $user_id } }
              ) {
                aggregate {
                  count
                }
              }
            }
          }
        }
      }
      ${[
        goalLevelFragment,
        userGoalLevelFragment,
        goalFragment,
        userGoalFragment,
      ]
        .map((fragment) => `${fragment}`)
        .join('')}
    `;
    return query;
  }

  /**
   *@deprecated its's migrated to getGoalLevels,this repo used in @function getLevels().
   */
  async getGoalLevels(userId: string): Promise<UserGoal[]> {
    const query = this.getGoalLevelsQuery();
    type result = { user_goals: UserGoal[] };
    const { user_goals } = await this.client.request<result>(query, {
      user_id: userId,
    });
    return user_goals;
  }

  /**
   *@description It is used for @function getGoalsHistory() that are in goals repository,but the app-side code is still using the getGoalsHistory action
   */
  getGoalsHistoryQuery(): string {
    const query = gql`
      query ($user_id: uuid!, $limit: Int = 20, $offset: Int!) {
        user_goals(where: { user_id: { _eq: $user_id } }) {
          goalByGoal {
            tool_kits {
              user_schedule_sessions(
                where: { user_id: { _eq: $user_id } }
                order_by: { session_date: desc }
                limit: $limit
                offset: $offset
              ) {
                ...schedule_session
                schedule {
                  ...schedule
                }
              }
            }
          }
        }
      }

      ${scheduleSessionFragment}
      ${scheduleFragment}
    `;
    return query;
  }

  private getPagination(
    query: Pick<GetHistoryQuery, 'limit' | 'page'>,
  ): Pick<GetHistoryQuery, 'limit' | 'page'> {
    const { page, limit } = query;
    const defaultLimit = limit >= 1 ? limit : 20;
    const defaultPage = page >= 1 ? page : 1;
    const finalPage = (defaultPage - 1) * defaultLimit;
    return { page: finalPage, limit: defaultLimit };
  }

  /**
   *@description its's migrated to getUserGoalHistory resolver but the app-side code is still using the getGoalsHistory action,It is used for @function getHistory() that are in goals service
   */
  async getGoalsHistory(
    userId: string,
    queryParams: GetHistoryQuery,
  ): Promise<UserGoal[]> {
    const query = this.getGoalsHistoryQuery();
    const { page, limit } = this.getPagination(queryParams);
    type data = { user_goals: UserGoal[] };
    const { user_goals } = await this.client.request<data>(query, {
      user_id: userId,
      offset: page,
      limit: Number(limit),
    });
    return user_goals;
  }

  async saveUserGoalLevel(
    saveUserGoalLevel: SaveUserGoalLevel,
  ): Promise<UserGoalLevel> {
    const { goal_level_id, user_id } = saveUserGoalLevel;
    const query = `INSERT INTO user_goal_levels (user_id,goal_level_id) VALUES ($1, $2 ) RETURNING *`;
    const [userGoalLevel] = await this.database.query<UserGoalLevel>(query, [
      user_id,
      goal_level_id,
    ]);
    return userGoalLevel;
  }

  async getGoalLevelById(id: string): Promise<GoalLevel> {
    const query = `SELECT * FROM goal_levels where id=$1`;
    const [goalLevels] = await this.database.query<GoalLevel>(query, [id]);
    return goalLevels;
  }

  async getGoals(): Promise<Goal[]> {
    const query = `SELECT * FROM goals`;
    const goals = await this.database.query<Goal>(query, []);
    return goals;
  }

  async deleteUserGoals(id: string): Promise<UserGoal[]> {
    const query = `DELETE FROM user_goals WHERE user_id=$1 RETURNING *;`;
    const userGoals = await this.database.query<UserGoal>(query, [id]);
    return userGoals;
  }

  async addUserGoals(goals: UserGoalDto[]): Promise<UserGoal[]> {
    const query = goals
      .map((goal) => {
        return `INSERT INTO user_goals (user_id,goal,is_selected) VALUES ('${goal.user_id}','${goal.goal}','${goal.is_selected}') RETURNING *;`;
      })
      .join('');
    const userGoals = await this.database.query<UserGoal>(query, []);
    return userGoals;
  }

  async getGoalsByAgeGroup(
    userId: string,
    ageGroup: string,
    organizationId: string,
  ): Promise<GolaWithUserGoal[]> {
    const query = `SELECT
    goals.*,
    COALESCE(
      json_agg(DISTINCT user_goals.*) FILTER (
        WHERE
          user_goals.id IS NOT NULL
      ),
      '[]'
    ) AS user_goals
  FROM
    goals
    LEFT JOIN user_goals ON user_goals.goal = goals.id
    AND user_goals.user_id = $1
    LEFT JOIN organisation_goals on organisation_goals.goal_id = goals.id
  WHERE
  $2 = ANY(age_group)
  AND organisation_goals.organisation_id = $3
  AND goals.id = user_goals.goal    
  GROUP BY
    goals.id`;
    const params: unknown[] = [userId, ageGroup, organizationId];
    const goals = await this.database.query<GolaWithUserGoal>(query, params);
    return goals;
  }

  async getUser(userId: string): Promise<User> {
    const query = `SELECT * FROM users WHERE id=$1`;
    const [user] = await this.database.query<User>(query, [userId]);
    return user;
  }

  async getGoalsWithLevels(
    userId: string,
    limit?: number,
  ): Promise<GoalWithLevels[]> {
    const query = `
    SELECT goals.*,json_agg(DISTINCT goal_levels.*) AS goal_levels,COALESCE(SUM(tool_kits.tool_kit_hlp_reward_points),0) as total FROM user_goals
JOIN goals ON goals.id=user_goals.goal AND goals.is_default = $2
JOIN (
  SELECT goal_levels.*,
  CASE
  WHEN goal_levels.id=user_goal_levels.goal_level_id THEN true ELSE false
  END AS is_completed
  FROM goal_levels
  LEFT JOIN user_goal_levels ON user_goal_levels.goal_level_id=goal_levels.id AND user_goal_levels.user_id=$1
  ORDER BY goal_levels.sequence_number ASC
) AS goal_levels ON goal_levels.goal_id=goals.id
LEFT JOIN (
  SELECT tool_kits.* FROM user_schedule_sessions
  JOIN tool_kits ON tool_kits.id=user_schedule_sessions.tool_kit_id
  WHERE user_schedule_sessions.user_id=$1
) AS tool_kits ON tool_kits.goal_id=goals.id
WHERE user_goals.user_id=$1
GROUP BY goals.id
${limit ? 'LIMIT $3' : ''}
    `;
    const params: unknown[] = [userId, false];
    if (limit) {
      params.push(limit);
    }
    const goals = await this.database.query<GoalWithLevels>(query, params);
    return goals;
  }
  async getGoalInfo(): Promise<GoalInfo> {
    const goalsInfoQuery = `SELECT * FROM goal_info`;
    const [goalInfo] = await this.database.query<GoalInfo>(goalsInfoQuery, []);
    return goalInfo;
  }

  async getGoalById(id: string): Promise<Goal> {
    const query = `SELECT * FROM goals WHERE id=$1`;
    const [goal] = await this.database.query<Goal>(query, [id]);
    return goal;
  }

  async getToolkitsByGoal(id: string): Promise<Toolkit[]> {
    const query = `SELECT * FROM tool_kits WHERE goal_id=$1`;
    const toolkits = await this.database.query<Toolkit>(query, [id]);
    return toolkits;
  }

  private prepareToolkitsAggrateQuery(toolkitAnswetableName: string[]): string {
    const query = toolkitAnswetableName.reduce(
      (agg: string, table: string, index: number) => {
        agg += `SELECT COALESCE(SUM(${table}.hlp_points_earned),0) AS hlp_earned FROM ${table} WHERE ${table}.user_id=$1
        ${index === toolkitAnswetableName.length - 1 ? '' : 'UNION'}
      `;
        return agg;
      },
      '',
    );
    return query;
  }

  async getTotalEarnedPointByGoal(
    userId: string,
    tableNames: string[],
  ): Promise<number> {
    const tablesQuery = this.prepareToolkitsAggrateQuery(tableNames);
    const query = `SELECT COALESCE(SUM(hlp_earned),0)::INTEGER AS total_hlp_earned FROM (${tablesQuery}) points`;
    const [{ total_hlp_earned }] = await this.database.query<{
      total_hlp_earned: number;
    }>(query, [userId]);
    return total_hlp_earned;
  }

  async getGoalByToolkiId(toolkitId: string): Promise<GoalEntity> {
    const query = `SELECT goals.* FROM tool_kits
    LEFT JOIN goals ON tool_kits.goal_id = goals.id
    WHERE tool_kits.id = $1`;
    const [goal] = await this.database.query<GoalEntity>(query, [toolkitId]);
    return goal;
  }

  async getUserGoalLevelsWithStatus(
    userId: string,
    goalId: string,
  ): Promise<GoalLevelWithStatus[]> {
    const query = `SELECT goal_levels.*,
    COALESCE(goal_levels.id = user_goal_levels.goal_level_id, false) AS is_completed
    FROM goal_levels
    LEFT JOIN user_goals ON user_goals.goal = $2 AND user_goals.user_id= $1
    LEFT JOIN user_goal_levels ON user_goal_levels.goal_level_id = goal_levels.id AND user_goal_levels.user_id = $1
    WHERE goal_levels.goal_id = $2 AND user_goals.user_id = $1 AND user_goals.goal = $2
    ORDER BY goal_levels.sequence_number ASC;`;
    const userGoalLevels = await this.database.query<GoalLevelWithStatus>(
      query,
      [userId, goalId],
    );
    return userGoalLevels;
  }

  async getGoalsCount(goalIds: string[]): Promise<number> {
    const query = `SELECT COUNT(*) FROM goals WHERE id = ANY($1::uuid[])`;
    const [{ count }] = await this.database.query<{ count: string }>(query, [
      goalIds,
    ]);

    return Number(count);
  }

  async updateOnboardingScreen(
    userId: string,
    screen: OnboardingScreen,
  ): Promise<Onboarding> {
    const query = `UPDATE onboardings SET screen=$1 WHERE "userId"= $2 RETURNING *`;
    const [updatedUserOnboarding] = await this.database.query<Onboarding>(
      query,
      [screen, userId],
    );
    return updatedUserOnboarding;
  }

  async getGoalHistory(
    page: number,
    limit: number,
    userId: string,
  ): Promise<{
    goalHistory: GetGoalHistory[];
    total: number;
  }> {
    const offset = (page - 1) * limit;
    const commonQuery = `SELECT
    schedules.id AS schedule_id,
    COALESCE(schedules.repeat_per_day, 1) AS total,
    TO_CHAR(
      (user_schedule_sessions.session_date),
      'YYYY-MM-DD'
    ) AS date,
    COUNT(user_schedule_sessions.schedule_id) AS completed,
    MAX(user_schedule_sessions.created_at) AS time,
    COALESCE(tool_kits.title) AS title
    FROM
    user_schedule_sessions
    LEFT JOIN schedules ON schedules.id = user_schedule_sessions.schedule_id
    LEFT JOIN tool_kits ON tool_kits.id = schedules.tool_kit
    LEFT JOIN user_goals ON user_goals.goal = tool_kits.goal_id
    WHERE
    user_schedule_sessions.user_id = $1
    AND user_goals.user_id = $1
    GROUP BY
    schedules.id,
    user_schedule_sessions.session_date,
    schedules.repeat_per_day,
    tool_kits.title`;
    const queryWithoutPagination = `
    SELECT CAST(COALESCE(COUNT(*),'0') AS INTEGER) AS total
    FROM (
      ${commonQuery}
    ) AS subquery;
    `;
    const queryWithPagination = `
    ${commonQuery}
    ORDER BY
    schedules.start_date DESC
    LIMIT $2
    OFFSET $3`;
    const [[{ total }], goalHistory] = await Promise.all([
      this.database.query<{ total: number }>(queryWithoutPagination, [userId]),
      this.database.query<GetGoalHistory>(queryWithPagination, [
        userId,
        limit,
        offset,
      ]),
    ]);

    return { goalHistory, total };
  }

  async getGoalCategoriesWithGoals(
    userId: string,
    ageGroup: string,
    organizationId: string,
    lang?: string,
  ): Promise<GoalCategoriesWithGoals[]> {
    const query = `
    SELECT
    goal_categories.id,
    CASE
      WHEN goal_categories.translations ->> $4 IS NOT NULL THEN (goal_categories.translations ->> $4) ::json ->> 'title'
      ELSE goal_categories.title
    END AS title,
    COALESCE(
      (
        SELECT
          JSON_AGG(goals.*)
        FROM
          (
            SELECT
              goals.*,
              CASE
                WHEN goals.translations ->> $4 IS NOT NULL THEN (goals.translations ->> $4) ::json ->> 'title'
                ELSE goals.title
              END AS title,
              CASE
                WHEN goals.translations ->> $4 IS NOT NULL THEN (goals.translations ->> $4) ::json ->> 'description'
                ELSE goals.description
              END AS description,
              CASE
                WHEN goals.translations ->> $4 IS NOT NULL THEN (goals.translations ->> $4) ::json ->> 'goal_info'
                ELSE goals.goal_info
              END AS goal_info,
              CASE
                WHEN user_goals.id IS NOT NULL THEN true
                ELSE false
              END AS is_selected
            FROM
              goals
              LEFT JOIN organisation_goals ON organisation_goals.goal_id = goals.id
              LEFT JOIN user_goals ON user_goals.user_id =$1
              AND user_goals.goal = goals.id
            WHERE
              goals.goal_category_id = goal_categories.id
              AND goals.is_default=false
              AND $2 = ANY(goals.age_group)
              AND organisation_goals.organisation_id = $3
            ORDER BY
              goals.created_at DESC
          ) AS goals
      ),
      '[]'
    ) AS goals
  FROM
    goal_categories
  ORDER BY
    goal_categories.sequence_number
    `;
    const params: unknown[] = [userId, ageGroup, organizationId, lang];
    const goals = await this.database.query<GoalCategoriesWithGoals>(
      query,
      params,
    );
    return goals;
  }

  async getDefaultGoals(): Promise<Goal[]> {
    const query = `SELECT * FROM goals WHERE is_default=$1`;
    const goal = await this.database.query<Goal>(query, [true]);
    return goal;
  }
}
