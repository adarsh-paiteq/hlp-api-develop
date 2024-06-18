import { Injectable } from '@nestjs/common';
import { gql } from 'graphql-request';
import { HasuraService } from '../shared/services/hasura/hasura.service';
import {
  UserTrophy,
  trophiesTable,
  Trophy,
  TrophyType,
  SaveUserTrophy,
} from './trophies.dto';
import { differenceInYears } from 'date-fns';
import { Database } from '../core/modules/database/database.service';

/**
 * @description Fragments are used in the @function getTrophiesQuery() and @function getTrophiesUserAlreadyAchievedQuery() functions within the trophies repository.
 */
const trophyFragment = gql`
  fragment trophy on trophies {
    id
    title
    short_description
    image_url
    image_id
    file_path
    trophy_type
    hlp_reward_points
    no_of_goals_done
    no_of_levels_done
    no_of_donations
    hlps_received
    streaks
    hlps_won
    challenges_won
    challenges_done
    posts_added
    reactions_added
    check_ins_done
    tools_done
    meditations_done
    channels_follow
    friends_follow
    hlps_donated
    account_duration_in_years
    created_at
    updated_at
  }
`;

/**
 * @description Fragments are used in the following functions: @function getUserTrophiesQuery() in the action repository, @function getUserTrophies() and @function getUserTrophyByTrophyId() in the trophies repository.
 */
export const userTrophyFragment = gql`
  fragment user_trophy on user_trophies {
    id
    user_id
    trophy_id
    created_at
    updated_at
  }
`;

@Injectable()
export default class TrophiesRepo {
  constructor(
    private readonly client: HasuraService,
    private readonly database: Database,
  ) {}

  /**
   * @deprecated The repository used in the @function getTrophiesAndUserTrophies() function is currently unused code and can be safely removed.
   */
  getUserTrophies(): string {
    const query = gql`
      query ($user_id: uuid!) {
        user_trophies(where: { user_id: { _eq: $user_id } }) {
          ...user_trophy
        }
      }
      ${userTrophyFragment}
    `;
    return query;
  }

  /**
   * @description The repository used in the @function getTrophiesAndTrophiesUserAchieved() function in the trophies service and the @function getTrophiesAndUserTrophies() function in the trophies repository.
   */
  getTrophiesQuery(): string {
    const query = gql`
      query {
        trophies {
          ...trophy
        }
      }
      ${trophyFragment}
    `;
    return query;
  }

  /**
   * @deprecated This code is no longer used and can be safely removed.
   */
  async getTrophiesAndUserTrophies(
    userId: string,
  ): Promise<{ trophies: Trophy[]; userTrophies: UserTrophy[] }> {
    const userTrophiesQuery = this.getUserTrophies();
    const trophiesQuery = this.getTrophiesQuery();
    type result = [
      { data: { trophies: Trophy[] } },
      { data: { user_trophies: UserTrophy[] } },
    ];
    const requests = [
      { document: trophiesQuery, variables: {} },
      { document: userTrophiesQuery, variables: { user_id: userId } },
    ];
    const [
      {
        data: { trophies },
      },
      {
        data: { user_trophies },
      },
    ] = await this.client.batchRequests<result>(requests);
    return {
      trophies,
      userTrophies: user_trophies,
    };
  }

  /**
   * @description The repository used in the @function getTrophiesAndTrophiesUserAchieved() function is the trophies repository.
   */
  getTrophiesUserAlreadyAchievedQuery(): string {
    const query = gql`
      query ($userId: uuid!) {
        user_trophies(where: { _and: [{ user_id: { _eq: $userId } }] }) {
          trophy {
            ...trophy
          }
        }
      }
      ${trophyFragment}
    `;
    return query;
  }

  /**
   * @description The repository used in the @function checkIfUserHasAchievedTheTrophy() function is utilized in the trophies service.
   */
  async getTrophiesAndTrophiesUserAchieved(
    userId: string,
  ): Promise<{ trophies: Trophy[]; user_trophies: Trophy[] }> {
    const trophyByUserIdAndTrophyIdQuery = this.getTrophiesQuery();
    const trophiesUserAlreadyAchieved =
      this.getTrophiesUserAlreadyAchievedQuery();
    type result = [
      { data: { trophies: Trophy[] } },
      {
        data: {
          user_trophies: { trophy: Trophy }[];
        };
      },
    ];
    const requests = [
      {
        document: trophyByUserIdAndTrophyIdQuery,
        variables: {},
      },
      { document: trophiesUserAlreadyAchieved, variables: { userId } },
    ];
    const res = await this.client.batchRequests<result>(requests);
    const [
      {
        data: { trophies },
      },
      {
        data: { user_trophies },
      },
    ] = res;
    const mappedUserTrophies = user_trophies.map((t: { trophy: Trophy }) => {
      return t.trophy;
    });
    return {
      trophies,
      user_trophies: mappedUserTrophies,
    };
  }

  /**
   * @description The repository used in the @function getNumberOfRequiredFields() function is the trophies repository.
   */
  getNumberOfRequiredFieldQuery(trophiesTable: string): string {
    const query = gql`
      query ($userId: uuid!) {
        ${trophiesTable}(where: { user_id: { _eq: $userId } }) {
          aggregate {
            count
          }
        }
      }
    `;
    return query;
  }

  /**
   * @description The repository used in the @function checkIfUserHasAchievedTheTrophy() function in the trophies service is the trophies repository.
   */
  async getNumberOfRequiredFields(
    userId: string,
    trophyTableName: TrophyType,
  ): Promise<number> {
    type result = { aggregate: { count: number } };
    const trophy = trophiesTable.get(trophyTableName) as string;
    const query = this.getNumberOfRequiredFieldQuery(trophy);
    const count = await this.client.request<Record<string, result>>(query, {
      userId,
    });
    return count[`${trophy}`].aggregate.count;
  }

  /**
   * @description The repository used in the @function getNumberOfHelped() function is the trophies repository.
   */
  getNumberOfHelpedQuery(): string {
    const query = gql`
      query ($userId: uuid!) {
        user_donations_aggregate(where: { donor_user_id: { _eq: $userId } }) {
          aggregate {
            count
          }
        }
      }
    `;
    return query;
  }

  /**
   * @description The repository used in the @function checkIfUserHasAchievedTheTrophy() function in the trophies service is the trophies repository.
   */
  async getNumberOfHelped(userId: string): Promise<number> {
    type result = { aggregate: { count: number } };
    const query = this.getNumberOfHelpedQuery();
    const count = await this.client.request<Record<string, result>>(query, {
      userId,
    });
    return count.user_donations_aggregate.aggregate.count;
  }

  /**
   * @description The repository used in the @function getNumberOfHlpDonated() function is the trophies repository.
   */
  getNumberOfHlpDonatedQuery(): string {
    const query = gql`
      query ($userId: uuid!) {
        user_donations_aggregate(where: { donor_user_id: { _eq: $userId } }) {
          aggregate {
            sum {
              hlp_reward_points_donated
            }
          }
        }
      }
    `;
    return query;
  }

  /**
   * @description The repository used in the @function checkIfUserHasAchievedTheTrophy() function in the trophies service is the trophies repository.
   */
  async getNumberOfHlpDonated(userId: string): Promise<number> {
    type result = { aggregate: { sum: { hlp_reward_points_donated: number } } };
    const query = this.getNumberOfHlpDonatedQuery();
    const count = await this.client.request<Record<string, result>>(query, {
      userId,
    });
    return count.user_donations_aggregate.aggregate.sum
      .hlp_reward_points_donated;
  }

  /**
   * @description The repository used in the @function getNumberOfHlpReceived() function is the trophies repository.
   */
  getNumberOfHlpRecievedQuery(): string {
    const query = gql`
      query ($userId: uuid!) {
        user_donations_aggregate(
          where: { receiver_user_id: { _eq: $userId } }
        ) {
          aggregate {
            sum {
              hlp_reward_points_donated
            }
          }
        }
      }
    `;
    return query;
  }

  /**
   * @description The repository used in the @function checkIfUserHasAchievedTheTrophy() function in the trophies service is the trophies repository.
   */
  async getNumberOfHlpRevieved(userId: string): Promise<number> {
    type result = { aggregate: { sum: { hlp_reward_points_donated: number } } };
    const query = this.getNumberOfHlpRecievedQuery();
    const count = await this.client.request<Record<string, result>>(query, {
      userId,
    });
    return count.user_donations_aggregate.aggregate.sum
      .hlp_reward_points_donated;
  }

  /**
   * @description The repository used in the @function getNumberOfChannelFollow() function is the trophies repository.
   */
  getNumberOfChannelFollowQuery(): string {
    const query = gql`
      query ($userId: uuid!) {
        user_channels_aggregate(
          where: {
            _and: [
              { user_id: { _eq: $userId } }
              { is_channel_unfollowed: { _eq: false } }
            ]
          }
        ) {
          aggregate {
            count
          }
        }
      }
    `;
    return query;
  }

  /**
   * @description The repository used in the @function checkIfUserHasAchievedTheTrophy() function in the trophies service is the trophies repository.
   */
  async getNumberOfChannelFollow(userId: string): Promise<number> {
    type result = { aggregate: { count: number } };
    const query = this.getNumberOfChannelFollowQuery();
    const count = await this.client.request<Record<string, result>>(query, {
      userId,
    });
    return count.user_channels_aggregate.aggregate.count;
  }

  /**
   * @description The repository used in the @function getAccountDuration() function is the trophies repository.
   */
  getAccountDurationQuery(): string {
    const query = gql`
      query ($userId: uuid!) {
        users_by_pk(id: $userId) {
          created_at
        }
      }
    `;
    return query;
  }

  /**
   * @description The repository used in the @function checkIfUserHasAchievedTheTrophy() function in the trophies service is the trophies repository.
   */
  async getAccountDuration(userId: string): Promise<number> {
    const query = this.getAccountDurationQuery();
    type result = { created_at: string };
    const {
      users_by_pk: { created_at },
    } = await this.client.request<Record<string, result>>(query, { userId });
    const accCreationDate = new Date(created_at);
    const diff = differenceInYears(new Date(), accCreationDate);
    return diff;
  }

  /**
   * @description The repository used in the @function getNumberOfChallengesWon() function is the trophies repository.
   */
  getChallengesWonQuery(): string {
    const query = gql`
      query ($userId: uuid!) {
        user_challenges_aggregate(
          where: {
            _and: [
              { user_id: { _eq: $userId } }
              {
                hlp_points_earned_for_winning_the_challenge: { _is_null: false }
              }
            ]
          }
        ) {
          aggregate {
            count
          }
        }
      }
    `;
    return query;
  }

  /**
   * @description The repository used in the @function checkIfUserHasAchievedTheTrophy() function in the trophies service is the trophies repository.
   */
  async getNumberOfChallengesWon(userId: string): Promise<number> {
    const query = this.getChallengesWonQuery();
    type result = { aggregate: { count: number } };
    const {
      user_challenges_aggregate: {
        aggregate: { count },
      },
    } = await this.client.request<Record<string, result>>(query, { userId });
    return count;
  }

  /**
   * @deprecated This code is no longer used and can be safely removed.
   */
  public async getUserTrophyByTrophyId(
    trophy_id: string,
    user_id: string,
  ): Promise<UserTrophy[]> {
    const query = gql`
      query GetUserTrophy($trophy_id: uuid!, $user_id: uuid!) {
        user_trophies(
          where: { trophy_id: { _eq: $trophy_id }, user_id: { _eq: $user_id } }
        ) {
          ...user_trophy
        }
      }
      ${userTrophyFragment}
    `;
    const userTrophy = await this.client.request<{
      user_trophies: Array<UserTrophy>;
    }>(query, { trophy_id, user_id });
    return userTrophy.user_trophies;
  }

  async saveUserTrophy(userTrophyData: SaveUserTrophy): Promise<UserTrophy> {
    const { user_id, trophy_id } = userTrophyData;
    const query = `INSERT INTO user_trophies (user_id, trophy_id) VALUES ($1, $2) RETURNING *;`;
    const [userTrophy] = await this.database.query<UserTrophy>(query, [
      user_id,
      trophy_id,
    ]);
    return userTrophy;
  }

  async getUserTrophy(user_id: string, trophy_id: string): Promise<UserTrophy> {
    const query = `SELECT * FROM user_trophies
    WHERE user_id = $1 AND trophy_id = $2;
    `;
    const [userTrophy] = await this.database.query<UserTrophy>(query, [
      user_id,
      trophy_id,
    ]);
    return userTrophy;
  }

  async getTrophiesWithStatus(
    userId: string,
    lang?: string,
  ): Promise<Trophy[]> {
    const query = `
    SELECT
    trophies.*,
    CASE
      WHEN user_trophies.trophy_id IS NOT NULL THEN true
      ELSE false
    END AS is_completed,
    CASE
      WHEN trophies.translations ->> $2 IS NOT NULL THEN (trophies.translations ->> $2)::json->>'title'
      ELSE trophies.title
    END AS title,
    CASE
      WHEN trophies.translations ->> $2 IS NOT NULL THEN (trophies.translations ->> $2)::json->>'short_description'
      ELSE trophies.short_description
    END AS short_description
  FROM
    trophies
  LEFT JOIN 
    user_trophies ON user_trophies.trophy_id = trophies.id AND user_trophies.user_id = $1;  

    `;
    const trophies = await this.database.query<Trophy>(query, [userId, lang]);
    return trophies;
  }

  async sessionLock(id: string): Promise<void> {
    return this.database.sessionLockByUUID(id);
  }
  async sessionUnlock(id: string): Promise<void> {
    return this.database.sessionUnlockByUUID(id);
  }
}
