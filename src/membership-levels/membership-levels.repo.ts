import { Injectable } from '@nestjs/common';
import { gql } from 'graphql-request';
import { Database } from '../core/modules/database/database.service';
import { HasuraService } from '../shared/services/hasura/hasura.service';
import {
  MembershipLevel,
  SaveUserMembershipLevel,
  UserMembershipLevel,
} from './membership-levels.dto';

/**
 * @description This Fragment is used by the @function getMembershipLevelByIdQuery() function within membership-level repository.
 and @function getMembershipLevelsQuery() function within membership-level repository, however This @function getMembershipLevelsQuery() function is unused and should no longer be used.
 */
const membershipLevelFragment = gql`
  fragment membership_level on membership_levels {
    hlp_reward_points
    hlp_reward_points_to_complete_this_level
    sequence_number
    title
    created_at
    updated_at
    id
    description
  }
`;

/**
 * @description This Fragment is used by the @function getUserMembershipLevelsQuery() function within actions repository,
  @function saveUserMembershipStage() function within membership-level repository and @function getUserMembershipLevelsQuery() function within membership-level repository, however This @function getUserMembershipLevelsQuery() function is unused and should no longer be used.
 */
export const userMembershipLevelFragment = gql`
  fragment user_membership_level on user_membership_levels {
    id
    user_id
    membership_level_id
    is_level_completed_by_user
    created_at
    updated_at
  }
`;

@Injectable()
export class MembershipLevelsRepo {
  constructor(
    private readonly client: HasuraService,
    private readonly database: Database,
  ) {}

  /**
   * @deprecated  This repository are used in @function getMembershipLevelsAndUserMembershipLevels(). This function is unused and should no longer be used
   */
  private getMembershipLevelsQuery(): string {
    const query = gql`
      query {
        membership_levels(order_by: [{ sequence_number: asc }]) {
          ...membership_level
        }
      }
      ${membershipLevelFragment}
    `;
    return query;
  }

  /**
   * @deprecated  This repository are used in @function getMembershipLevelsAndUserMembershipLevels(). This function is unused and should no longer be used
   */
  private getUserMembershipLevelsQuery(): string {
    const query = gql`
      query ($userId: uuid!) {
        user_membership_levels(where: { user_id: { _eq: $userId } }) {
          ...user_membership_level
        }
      }
      ${userMembershipLevelFragment}
    `;
    return query;
  }

  /**
   * @deprecated This code is unused and should no longer be used
   */
  async getMembershipLevelsAndUserMembershipLevels(userId: string): Promise<{
    membership_levels: MembershipLevel[];
    user_membership_levels: UserMembershipLevel[];
  }> {
    const userMembershipLevelsQuery = this.getUserMembershipLevelsQuery();
    const membershipLevelsQuery = this.getMembershipLevelsQuery();

    type result = [
      { data: { membership_levels: MembershipLevel[] } },
      { data: { user_membership_levels: UserMembershipLevel[] } },
    ];

    const requests = [
      { document: membershipLevelsQuery, variables: {} },
      { document: userMembershipLevelsQuery, variables: { userId } },
    ];

    const [
      {
        data: { membership_levels },
      },
      {
        data: { user_membership_levels },
      },
    ] = await this.client.batchRequests<result>(requests);

    return { membership_levels, user_membership_levels };
  }

  /**
   * @description This repository is used by the @function saveUserMembershipLevel() function within membership-level service.
   */
  async saveUserMembershipStage(
    membershipStage: SaveUserMembershipLevel,
  ): Promise<UserMembershipLevel> {
    const mutation = gql`
      mutation ($level: user_membership_levels_insert_input!) {
        insert_user_membership_levels_one(object: $level) {
          ...user_membership_level
        }
      }
      ${userMembershipLevelFragment}
    `;
    type result = { insert_user_membership_levels_one: UserMembershipLevel };
    const { insert_user_membership_levels_one } =
      await this.client.request<result>(mutation, {
        level: membershipStage,
      });
    return insert_user_membership_levels_one;
  }

  /**
   * @description This repository is used by the @function getMembershipLevelById() function within membership-level service.
   */
  private getMembershipLevelByIdQuery(): string {
    const query = gql`
      query ($levelId: uuid!) {
        membership_levels_by_pk(id: $levelId) {
          ...membership_level
        }
      }
      ${membershipLevelFragment}
    `;
    return query;
  }

  /**
   * @description This repository is used by the @function getMembershipLevelById() function within rewards service. It is Retrieves a membership level by ID.
   */
  async getMembershipLevelById(id: string): Promise<MembershipLevel> {
    const query = this.getMembershipLevelByIdQuery();
    type result = { membership_levels_by_pk: MembershipLevel };
    const { membership_levels_by_pk } = await this.client.request<result>(
      query,
      { levelId: id },
    );
    return membership_levels_by_pk;
  }

  async getMembershipLevelsWithStatus(
    userId: string,
  ): Promise<MembershipLevel[]> {
    const query = `
    SELECT membership_levels.*,user_membership_levels.is_level_completed_by_user
    AS is_completed
    FROM membership_levels
    LEFT JOIN (SELECT DISTINCT membership_level_id,user_id,is_level_completed_by_user FROM user_membership_levels) user_membership_levels
    ON user_membership_levels.membership_level_id=membership_levels.id
    AND user_membership_levels.user_id=$1
    ORDER by membership_levels.sequence_number
    `;
    const membershipLevels = await this.database.query<MembershipLevel>(query, [
      userId,
    ]);
    return membershipLevels;
  }

  async getUserMembershipLevel(
    membershipLevelId: string,
    userId: string,
  ): Promise<UserMembershipLevel> {
    const query = `
    SELECT * FROM user_membership_levels WHERE user_id=$1 AND membership_level_id=$2
    `;
    const [userMembershipLevel] =
      await this.database.query<UserMembershipLevel>(query, [
        userId,
        membershipLevelId,
      ]);
    return userMembershipLevel;
  }

  async getUserEarnedPoints(userId: string): Promise<number> {
    const query = `SELECT COALESCE(SUM(user_rewards.hlp_reward_points_awarded),0) AS earned FROM user_rewards  WHERE user_id='${userId}'  GROUP BY user_rewards.user_id
    `;
    const [{ earned }] = await this.database.query<{ earned: number }>(query);
    return earned;
  }
}
