import { Injectable } from '@nestjs/common';
import { HasuraService } from '../shared/services/hasura/hasura.service';
import { gql } from 'graphql-request';
import { ToolkitStreak, UserStreak } from './streaks.dto';
import { ScheduleSessionsRepo } from '../schedule-sessions/schedule-sessions.repo';

/**
 * @description  Fragments are used in the @function getStreakByIdQuery() function in the reward repository and the @function getToolKitStreaksByIdQuery() function in the streaks repository.
 */
export const toolKitStreakFragment = gql`
  fragment toolkit_streak on toolkit_streaks {
    id
    tool_kit
    toolKitByToolKit {
      title
    }
    streak_count
    streak_points
    created_at
    updated_at
    sequence_number
  }
`;

/**
 * @description Fragments are utilized in the @function getUserStreaksByToolKitIdQuery() and @function saveStreak() functions, both of which are present in the streaks repository.
 */
const streakFragment = gql`
  fragment user_streak on user_streaks {
    id
    tool_kit_id
    updated_at
    created_at
    streak_id
    user_id
  }
`;

@Injectable()
export class StreaksRepo {
  constructor(
    private readonly client: HasuraService,
    private readonly scheduleSessionRepo: ScheduleSessionsRepo,
  ) {}

  /**
   * @description The @function getUserAndToolkitStreaks() function, @function getToolKitStreaksById(), and @function getStreaksAndSessions() functions all utilize the repository in the streaks module.
   */
  private getToolKitStreaksByIdQuery() {
    const query = gql`
      query getToolKitStreaksById($toolKitId: uuid!) {
        toolkit_streaks(where: { tool_kit: { _eq: $toolKitId } }) {
          ...toolkit_streak
        }
      }
      ${toolKitStreakFragment}
    `;
    return query;
  }

  /**
   * @description The @function getUserAndToolkitStreaks(), @function getStreaksAndSessions(), and @function getStreaksAndSessions() functions all utilize the repository in the streaks module.
   */
  private getUserStreaksByToolKitIdQuery() {
    const query = gql`
      query getUserStreaksByToolKitId($userId: uuid!, $toolKitId: uuid!) {
        user_streaks(
          where: {
            _and: [
              { user_id: { _eq: $userId } }
              { tool_kit_id: { _eq: $toolKitId } }
            ]
          }
        ) {
          ...user_streak
        }
      }
      ${streakFragment}
    `;
    return query;
  }

  /**
   * @deprecated The @function getUserToolkitStreaksHistory() function in the streaks service utilizes a repository.
   */
  async getUserAndToolkitStreaks(userId: string, toolKitId: string) {
    const toolKitQuery = this.getToolKitStreaksByIdQuery();
    const userStreaksQuery = this.getUserStreaksByToolKitIdQuery();
    type result = [
      { data: { toolkit_streaks: ToolkitStreak[] } },
      { data: { user_streaks: UserStreak[] } },
    ];
    const [
      {
        data: { toolkit_streaks },
      },
      {
        data: { user_streaks },
      },
    ] = await this.client.batchRequests<result>([
      { document: toolKitQuery, variables: { toolKitId } },
      { document: userStreaksQuery, variables: { userId, toolKitId } },
    ]);
    return { toolkit_streaks, user_streaks };
  }

  /**
   * @description The @function getNextStreak() function in the streaks service utilizes a repository.
   */
  async getStreaksAndSessions(userId: string, toolKitId: string) {
    const toolKitQuery = this.getToolKitStreaksByIdQuery();
    const userStreaksQuery = this.getUserStreaksByToolKitIdQuery();
    const sessionsQuery =
      this.scheduleSessionRepo.getToolKitSessionsCountQuery();
    const requests = [
      { document: toolKitQuery, variables: { toolKitId } },
      { document: userStreaksQuery, variables: { userId, toolKitId } },
      { document: sessionsQuery, variables: { userId, toolKitId } },
    ];
    type result = [
      { data: { toolkit_streaks: ToolkitStreak[] } },
      { data: { user_streaks: UserStreak[] } },
      {
        data: {
          user_schedule_sessions_aggregate: { aggregate: { count: number } };
        };
      },
    ];
    const [
      {
        data: { toolkit_streaks },
      },
      {
        data: { user_streaks },
      },
      {
        data: {
          user_schedule_sessions_aggregate: {
            aggregate: { count },
          },
        },
      },
    ] = await this.client.batchRequests<result>(requests);
    return { user_streaks, toolkit_streaks, count };
  }

  /**
   * @description The @function addUserStreak() function in the streaks service utilizes a repository.
   */
  async saveStreak(streak: UserStreak) {
    const mutation = gql`
      mutation ($streak: user_streaks_insert_input!) {
        insert_user_streaks_one(object: $streak) {
          ...user_streak
        }
      }
      ${streakFragment}
    `;
    type result = { insert_user_streaks_one: UserStreak };
    const { insert_user_streaks_one } = await this.client.request<result>(
      mutation,
      { streak },
    );
    return insert_user_streaks_one;
  }

  /**
   * @deprecated This code is no longer used and can be safely removed.
   */
  async getToolKitStreaksById(toolKitId: string) {
    const query = this.getToolKitStreaksByIdQuery();
    const { toolkit_streaks } = await this.client.request<{
      toolkit_streaks: ToolkitStreak[];
    }>(query, { toolKitId });
    return toolkit_streaks;
  }

  //   async getUserStreaksByToolKitId(userId: string, toolKitId: string) {
  //     const query = this.getUserStreaksByToolKitIdQuery();
  //     const { user_streaks } = await this.client.request<{
  //       user_streaks: UserStreak[];
  //     }>(query, { userId, toolKitId });
  //     return user_streaks;
  //   }
}
