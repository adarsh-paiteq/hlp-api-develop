import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { gql } from 'graphql-request';
import { User } from '../users/users.dto';
import { UsersRepo } from '../users/users.repo';
import {
  MembershipStage,
  SaveUserMembershipStageDto,
} from './membership-stages.dto';
import { Database } from '../core/modules/database/database.service';
import { UserMembershipStage } from './entities/user-membership-stages.entity';
import { MembershipStage as MembershipStageNew } from './membership-stages.model';

/**
 * @deprecated This fragment is utilized in the @function getShopItemByIdAndUserMembershipStagesQuery() functions in the users repository. However, the users repository code is no longer available.
  and @function getUserMembershipStagesQuery() in the actions repository.
*/
export const userMembershipStageFragment = gql`
  fragment user_membership_stage on user_membership_stages {
    id
    user_id
    membership_stage_id
    created_at
    updated_at
  }
`;

@Injectable()
export class MembershipStagesRepo {
  constructor(
    @Inject(forwardRef(() => UsersRepo)) private readonly usersRepo: UsersRepo,
    private readonly database: Database,
  ) {}

  async saveUserMembershipStage(
    membershipStage: SaveUserMembershipStageDto,
  ): Promise<UserMembershipStage> {
    const { user_id, membership_stage_id } = membershipStage;
    const query = `INSERT INTO user_membership_stages (user_id,membership_stage_id) VALUES ($1,$2) RETURNING *;`;
    const [userMembershipStage] =
      await this.database.query<UserMembershipStage>(query, [
        user_id,
        membership_stage_id,
      ]);
    return userMembershipStage;
  }

  async getMembershipStageById(
    membershipStageId: string,
  ): Promise<MembershipStageNew> {
    const query = `SELECT * FROM membership_stages WHERE id = $1`;
    const [membershipStage] = await this.database.query<MembershipStageNew>(
      query,
      [membershipStageId],
    );

    return membershipStage;
  }

  async getUser(userId: string): Promise<User> {
    const query = `SELECT * FROM users where id = $1`;
    const [user] = await this.database.query<User>(query, [userId]);
    return user;
  }

  async getMembershipStagesWithStatus(
    userId: string,
  ): Promise<MembershipStage[]> {
    const query = `SELECT
    membership_stages.*,
    to_json(membership_levels) AS membership_level,
    CASE
      WHEN membership_stages.id = user_membership_stages.membership_stage_id THEN true
      ELSE false
    END AS is_completed,
    CASE
      WHEN membership_stages.membership_level_id = user_membership_levels.membership_level_id THEN true
      ELSE false
    END AS has_membership_level
  FROM
    membership_stages
    LEFT JOIN (SELECT DISTINCT membership_stage_id,user_id FROM user_membership_stages) user_membership_stages ON membership_stages.id = user_membership_stages.membership_stage_id
    AND user_membership_stages.user_id = $1
    LEFT JOIN ( SELECT DISTINCT membership_level_id, user_id, is_level_completed_by_user
      FROM user_membership_levels )
      user_membership_levels ON membership_stages.membership_level_id = user_membership_levels.membership_level_id
    AND user_membership_levels.user_id = $1
    LEFT JOIN membership_levels ON membership_levels.id = membership_stages.membership_level_id
    ORDER BY membership_stages.sequence_number ASC
    `;
    const membershipStages = await this.database.query<MembershipStage>(query, [
      userId,
    ]);
    return membershipStages;
  }

  async getUserDonationsCount(userId: string): Promise<number> {
    const query = `SELECT COALESCE(COUNT(*),0) AS total FROM user_donations WHERE user_donations.donor_user_id=$1
    `;
    const [result] = await this.database.query<{ total: number }>(query, [
      userId,
    ]);
    return result.total;
  }

  async getUserMembershipStage(
    userId: string,
    stageId: string,
  ): Promise<UserMembershipStage> {
    const query = `SELECT * FROM user_membership_stages WHERE user_id = $1 AND membership_stage_id = $2`;
    const [userMembershipStage] =
      await this.database.query<UserMembershipStage>(query, [userId, stageId]);

    return userMembershipStage;
  }
}
