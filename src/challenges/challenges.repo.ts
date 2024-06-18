import { Injectable, Logger } from '@nestjs/common';
import { BatchRequestDocument, gql } from 'graphql-request';
import { Schedule, ScheduleWithToolkit } from '../schedules/schedules.dto';
import { scheduleFragment } from '../schedules/schedules.repo';
import { Database } from '../core/modules/database/database.service';
import { HasuraService } from '../shared/services/hasura/hasura.service';
import { UserDto } from '../users/users.dto';
import { userFragment } from '../users/users.repo';
import {
  Challenge,
  ChallengeStatus,
  GetChallengeAndSchedule,
  UpdateUserChallenge,
  UserChallenges,
} from './challenges.dto';
import {
  AddChallengeArgs,
  UpdateChallengeArgs,
  UserRanking,
  ChallengeResponse,
  Challenge as ChallengeNew,
} from './challenges.model';
import { ScheduleSession } from '../checkins/checkins.dto';
import { GetChallengeInfoResponse } from './dto/challenge.dto';
import { ToolkitType } from '../toolkits/toolkits.model';

/**
 *@deprecated This Fragmnet is used in @function getChallengesAndUserQuery () in challanges repository,This code is unused and should no longer be used.
 */
export const challengeFragment = gql`
  fragment challenge on challenges {
    is_challenge_completed
    challenge_end_date
    challenge_start_date
    hlp_reward_points_required_for_completing_goal
    hlp_reward_points_required_for_winning_challenge
    hlp_reward_points_to_be_awarded_for_completing_goal
    hlp_reward_points_to_be_awarded_for_winning_challenge
    total_days
    description
    emoji
    file_path
    image_id
    image_url
    label
    short_description
    title
    created_at
    updated_at
    id
    tool_kit_id
  }
`;

/**
 * @deprecated unused code
 */
export const userChallengeFragment = gql``;

@Injectable()
export class ChallengesRepo {
  private readonly logger = new Logger(ChallengesRepo.name);
  constructor(
    private readonly client: HasuraService,
    private readonly database: Database,
  ) {}

  /**
   *@deprecated It is used in @function getChallengeAndSchedule () in challanges repository,This code is unused and should no longer be used.
   */
  private getChallengesAndUserQuery(): string {
    const query = gql`
      query ($challenge_id: uuid!, $user_id: uuid!) {
        challenge: challenges_by_pk(id: $challenge_id) {
          ...challenge
          tool_kit {
            id
            tool_kit_hlp_reward_points
            tool_kit_result_screen_image
          }
        }
        user: users_by_pk(id: $user_id) {
          ...user
          membership_level {
            title
          }
        }
      }
      ${challengeFragment}
      ${userFragment}
    `;
    return query;
  }

  /**
   *@deprecated It is used in @function getChallengeAndSchedule () in challanges repository,This code is unused and should no longer be used.
   */
  private getScheduleAndSessions(): string {
    const query = gql`
      query ($challenge_id: uuid, $start_date: date!, $end_date: date!) {
        schedules(where: { challenge_id: { _eq: $challenge_id } }) {
          ...schedule
          user_schedule_sessions(
            where: {
              _and: [
                { session_date: { _gte: $start_date } }
                { session_date: { _lte: $end_date } }
              ]
            }
          ) {
            id
            session_date
            session_id
          }
        }
      }
      ${scheduleFragment}
    `;
    return query;
  }

  /**
   *@deprecated This code is unused and should no longer be used.
   */
  async getChallengeAndSchedule(
    challegeId: string,
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<GetChallengeAndSchedule> {
    const challegeQuery = this.getChallengesAndUserQuery();
    const schedulesQuery = this.getScheduleAndSessions();

    const requests: BatchRequestDocument[] = [
      {
        document: challegeQuery,
        variables: { challenge_id: challegeId, user_id: userId },
      },
      {
        document: schedulesQuery,
        variables: {
          challenge_id: challegeId,
          start_date: startDate,
          end_date: endDate,
        },
      },
    ];
    type result = [
      {
        data: { challenge: Challenge; user: UserDto };
      },
      {
        data: { schedules: Schedule[] };
      },
    ];
    const [
      {
        data: { challenge, user },
      },
      {
        data: { schedules },
      },
    ] = await this.client.batchRequests<result>(requests);
    const [schedule] = schedules;
    return {
      challenge,
      user,
      schedule,
    };
  }

  async getChallenge(
    id: string,
  ): Promise<Challenge & { tool_kit_type: ToolkitType }> {
    const query = `SELECT challenges.*,tool_kits.tool_kit_type FROM challenges
    INNER JOIN tool_kits ON tool_kits.id=challenges.tool_kit_id
    WHERE challenges.id=$1`;
    const [challenge] = await this.database.query<
      Challenge & { tool_kit_type: ToolkitType }
    >(query, [id]);
    return challenge;
  }

  async getUsersWithPoints(
    tableName: string,
    challengeId: string,
  ): Promise<UserRanking[]> {
    const query = `SELECT 
    users.id AS user_id, 
    users.full_name, 
    users.avatar, 
    users.avatar_image_name, 
    users.user_name, 
    COALESCE(SUM(${tableName}.hlp_points_earned), 0) AS hlp_points_earned
    FROM user_challenges
    LEFT JOIN users ON users.id = user_challenges.user_id
    LEFT JOIN ${tableName} ON ${tableName}.user_id = users.id AND ${tableName}.challenge_id = user_challenges.challenge_id
    WHERE user_challenges.challenge_id = $1
    GROUP BY users.id
    ORDER BY hlp_points_earned DESC`;
    const users = await this.database.query<UserRanking>(query, [challengeId]);
    return users;
  }

  async getActiveChallengeByToolkitId(
    tool_kit_id: string,
  ): Promise<ChallengeResponse> {
    const query = `SELECT * FROM challenges WHERE tool_kit_id = $1 AND is_challenge_completed = $2`;
    const [challenge] = await this.database.query<ChallengeResponse>(query, [
      tool_kit_id,
      'false',
    ]);
    return challenge;
  }

  async getChallengeById(challegeId: string): Promise<ChallengeResponse> {
    const query = `SELECT * FROM challenges WHERE id = $1`;
    const [challenge] = await this.database.query<ChallengeResponse>(query, [
      challegeId,
    ]);
    return challenge;
  }

  async createChallenge(
    challengeDetails: AddChallengeArgs,
  ): Promise<ChallengeResponse> {
    const parameters = [...Object.values(challengeDetails)];
    const query =
      'INSERT INTO challenges (' +
      Object.keys(challengeDetails)
        .map((key) => `${key}`)
        .join(', ') +
      ') VALUES (' +
      Object.values(challengeDetails)
        .map((value, index) => `$${index + 1}`)
        .join(', ') +
      ') RETURNING *;';

    const [newChallange] = await this.database.query<ChallengeResponse>(
      query,
      parameters,
    );
    return newChallange;
  }

  async updateChallenge(
    challegeId: string,
    challengeDetails: UpdateChallengeArgs,
  ): Promise<ChallengeResponse> {
    const parameters = [...Object.values(challengeDetails), challegeId];
    const query =
      'UPDATE challenges SET ' +
      Object.keys(challengeDetails)
        .map((key, index) => `${key} = $${index + 1}`)
        .join(', ') +
      ` WHERE id = $${parameters.length} RETURNING *;`;

    const [updatedChallange] = await this.database.query<ChallengeResponse>(
      query,
      parameters,
    );
    return updatedChallange;
  }

  async updateChallengeAsCompleted(challengeId: string): Promise<ChallengeNew> {
    const query =
      'UPDATE challenges SET is_challenge_completed = $1 WHERE id = $2 RETURNING *;';
    const [updatedChallange] = await this.database.query<ChallengeNew>(query, [
      'true',
      challengeId,
    ]);
    return updatedChallange;
  }

  async getUserChallenge(
    userId: string,
    challengeId: string,
  ): Promise<UserChallenges> {
    const query = `SELECT * FROM user_challenges WHERE user_id= $1 AND challenge_id= $2`;
    const [userChallenge] = await this.database.query<UserChallenges>(query, [
      userId,
      challengeId,
    ]);
    return userChallenge;
  }

  async getChallengeWinner(challengeId: string): Promise<UserChallenges> {
    const query = `SELECT * FROM user_challenges
    WHERE challenge_id=$1 AND is_winner=$2 AND status=$3;`;
    const [userChallenge] = await this.database.query<UserChallenges>(query, [
      challengeId,
      'true',
      ChallengeStatus.COMPLETED,
    ]);
    return userChallenge;
  }

  async updateUserChallenge(
    challengeId: string,
    userId: string,
    userChallenge: UpdateUserChallenge,
  ): Promise<UserChallenges> {
    const parameters = [...Object.values(userChallenge)];
    const query =
      'UPDATE user_challenges SET ' +
      Object.keys(userChallenge)
        .map((key, index) => `${key} = $${index + 1}`)
        .join(', ') +
      ` WHERE challenge_id = '${challengeId}' AND user_id = '${userId}' RETURNING *;`;
    const [updatedChallange] = await this.database.query<UserChallenges>(
      query,
      parameters,
    );
    return updatedChallange;
  }

  async getActiveChallengeById(
    challengeId: string,
  ): Promise<ChallengeResponse> {
    const query = `SELECT * FROM challenges WHERE id = $1 AND is_challenge_completed = $2`;
    const [challenge] = await this.database.query<ChallengeResponse>(query, [
      challengeId,
      'false',
    ]);
    return challenge;
  }

  async getScheduleWithToolkit(
    challengeId: string,
    userId: string,
  ): Promise<ScheduleWithToolkit> {
    const query = `SELECT schedules.*,row_to_json(tool_kits.*) AS toolkit FROM schedules LEFT JOIN tool_kits ON tool_kits.id=schedules.tool_kit WHERE schedules.user=$2 AND schedules.challenge_id=$1`;
    const [schedule] = await this.database.query<ScheduleWithToolkit>(query, [
      challengeId,
      userId,
    ]);
    return schedule;
  }

  async getChallengeSessions(
    tableName: string,
    challengeId: string,
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<ScheduleSession[]> {
    const query = `SELECT * FROM ${tableName} WHERE session_date  BETWEEN $3 AND $4 AND challenge_id=$1 AND user_id=$2`;
    const sessions = await this.database.query<ScheduleSession>(query, [
      challengeId,
      userId,
      startDate,
      endDate,
    ]);
    return sessions;
  }

  async disableChallengeSchedules(challengeId: string): Promise<Schedule[]> {
    const query = `UPDATE schedules SET is_schedule_disabled=true WHERE challenge_id=$1 RETURNING *`;
    const result = await this.database.query<Schedule>(query, [challengeId]);
    return result;
  }

  async getChallengeInfoById(
    userId: string,
    challengeId: string,
  ): Promise<GetChallengeInfoResponse> {
    const challengeInfoQuery = `SELECT challenges.*,
    ROW_TO_JSON(tool_kits.*) AS tool_kit,
    COALESCE(JSON_AGG(user_challenges.*) FILTER (WHERE user_challenges.id IS NOT NULL),'[]') AS user_challenges
    FROM challenges
    LEFT JOIN tool_kits ON tool_kits.id=challenges.tool_kit_id
    LEFT JOIN user_challenges ON user_challenges.challenge_id=challenges.id AND user_challenges.user_id=$1
    WHERE challenges.id=$2
    GROUP BY challenges.id,tool_kits.id`;
    const [challengeInfo] = await this.database.query<GetChallengeInfoResponse>(
      challengeInfoQuery,
      [userId, challengeId],
    );
    return challengeInfo;
  }
}
