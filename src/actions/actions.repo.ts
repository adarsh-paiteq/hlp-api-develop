import { Injectable } from '@nestjs/common';
import { BatchRequestDocument, gql } from 'graphql-request';
import { Database } from '../core/modules/database/database.service';
import { Users } from '../users/users.model';
import { UserMembershipLevel } from '../membership-levels/membership-levels.dto';
import { userMembershipLevelFragment } from '../membership-levels/membership-levels.repo';
import { UserMembershipStage } from '../membership-stages/entities/user-membership-stages.entity';
import { userMembershipStageFragment } from '../membership-stages/membership-stages.repo';
import { ScheduleSessionDto } from '../schedule-sessions/schedule-sessions.dto';
import { scheduleSessionFragment } from '../schedule-sessions/schedule-sessions.repo';
import { HasuraService } from '../shared/services/hasura/hasura.service';
import { UserTrophy } from '../trophies/trophies.dto';
import { userTrophyFragment } from '../trophies/trophies.repo';
import { User } from '../users/users.dto';
import { userFragment } from '../users/users.repo';
import { Action, UserAction, UserActionDto, UserCheckin } from './actions.dto';
import { GetActionInfoResponse } from './dto/actions.dto';
import { Actions } from './dto/get-user-action.dto';

/**
 * @deprecated This Fragment used in @function getActionsQuery()  that are used in action repository.
 */
const actionFragment = gql`
  fragment action on actions {
    action_type
    description
    file_path
    image_id
    image_url
    link_url
    short_description
    sub_title
    title
    created_at
    updated_at
    id
    membership_stage_id
    action_trophies @include(if: $includTypes) {
      trophy {
        id
        title
      }
    }
    action_tool_kits @include(if: $includTypes) {
      tool_kit {
        id
        title
      }
    }
    action_levels @include(if: $includTypes) {
      membership_level {
        id
        title
      }
    }
    action_check_ins @include(if: $includTypes) {
      check_in {
        title
        id
      }
    }
  }
`;

/**
 * @deprecated This Fragment used in @function getUserActionsQuery() and  @function saveUserAction() that are used in action repository.
 */
const userActionFragment = gql`
  fragment user_action on user_actions {
    id
    action_id
    user_id
    voucher_code
    created_at
    updated_at
  }
`;

/**
 * @deprecated This Fragment used in @function getUserCheckinsQuery() that are used in action repository.
 */
const userCheckinFragment = gql`
  fragment user_checkin on user_check_ins {
    id
    check_in
    user_id
    created_at
    updated_at
  }
`;

export type ActionTypesData = {
  user_membership_levels: UserMembershipLevel[];
  user_trophies: UserTrophy[];
  user_schedule_sessions: ScheduleSessionDto[];
  user_check_ins: UserCheckin[];
};
@Injectable()
export class ActionsRepo {
  constructor(
    private readonly client: HasuraService,
    private readonly database: Database,
  ) {}

  /**
   * @deprecated This repo used in @function getActionsAndUserActions() that are used in action repository.
   */
  private getActionsQuery(): string {
    const query = gql`
      query ($includTypes: Boolean = false) {
        actions {
          ...action
          membership_stage {
            title
            color_code
          }
        }
      }
      ${actionFragment}
    `;
    return query;
  }

  private getActionquery(): string {
    const query = `SELECT
    actions.*,
    (
      SELECT
        COALESCE(
          JSON_AGG(json_build_object('check_in', check_ins.*)),
          '[]'
        )
      FROM
        action_check_ins
        JOIN check_ins ON check_ins.id = action_check_ins.check_in_id
      WHERE
        action_check_ins.action_id = actions.id
    ) AS action_check_ins,
    (
      SELECT
        COALESCE(
          JSON_AGG(
            json_build_object('membership_level', membership_levels.*)
          ),
          '[]'
        )
      FROM
        action_levels
        JOIN membership_levels ON membership_levels.id = action_levels.membership_level_id
      WHERE
        action_levels.action_id = actions.id
    ) AS action_levels,
    (
      SELECT
        COALESCE(
          JSON_AGG(json_build_object('tool_kit', tool_kits.*)),
          '[]'
        )
      FROM
        action_tool_kits
        JOIN tool_kits ON tool_kits.id = action_tool_kits.tool_kit_id
      WHERE
        action_tool_kits.action_id = actions.id
    ) AS action_tool_kits,
    (
      SELECT
        COALESCE(
          JSON_AGG(json_build_object('trophy', trophies.*)),
          '[]'
        )
      FROM
        action_trophies
        JOIN trophies ON trophies.id = action_trophies.trophy_id
      WHERE
        action_trophies.action_id = actions.id
    ) AS action_trophies,
    COALESCE(ROW_TO_JSON(membership_stages.*), 'null') AS membership_stage
  FROM
    actions
    LEFT JOIN membership_stages ON membership_stages.id = actions.membership_stage_id
  GROUP BY
    actions.id,
    membership_stages.id;`;
    return query;
  }

  /**
   * @deprecated This repo used in @function getActionsAndUserActions() and @function getActionAndUserActions() that are used in action repository.
   These functions serve to retrieve a combination of actions and user actions for further processing or analysis.
   */
  private getUserActionsQuery(): string {
    const query = gql`
      query ($user_id: uuid!) {
        user_actions(where: { user_id: { _eq: $user_id } }) {
          ...user_action
        }
      }
      ${userActionFragment}
    `;
    return query;
  }

  private getUserActionQuery(userId: string): string {
    const query = `SELECT * FROM user_actions WHERE user_id = '${userId}'; `;
    return query;
  }

  /**
   * @deprecated This repo used in @function getActionTypesData() that are used in action repository.
   The purpose of the @function getActionTypesData()  function is to retrieve data related to action types, providing essential information for handling actions in the action repository.
   */
  private getUserScheduleSessionsQuery(): string {
    const query = gql`
      query ($user_id: uuid!) {
        user_schedule_sessions(where: { user_id: { _eq: $user_id } }) {
          ...schedule_session
        }
      }
      ${scheduleSessionFragment}
    `;
    return query;
  }
  private getUserTrophieQuery(userId: string): string {
    const query = `SELECT * FROM user_trophies WHERE user_id = '${userId}';`;
    return query;
  }
  private getUserScheduleSessionQuery(userId: string): string {
    const query = `SELECT * FROM user_schedule_sessions WHERE user_id = '${userId}';`;
    return query;
  }

  /**
   * @deprecated This repo used in @function getActionTypesData() that are used in action repository.
    The purpose of the @function getActionTypesData()  function is to retrieve data related to action types, providing essential information for handling actions in the action repository.
   */
  private getUserTrophiesQuery(): string {
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
  private getUserMembershipLevelQuery(userId: string): string {
    const query = `SELECT * FROM user_membership_levels WHERE user_id = '${userId}';`;
    return query;
  }

  /**
   * @deprecated This repo used in @function getActionTypesData() that are used in action repository.
   The purpose of the @function getActionTypesData()  function is to retrieve data related to action types, providing essential information for handling actions in the action repository.
   */

  private getUserMembershipLevelsQuery(): string {
    const query = gql`
      query ($user_id: uuid!) {
        user_membership_levels(where: { user_id: { _eq: $user_id } }) {
          ...user_membership_level
        }
      }
      ${userMembershipLevelFragment}
    `;
    return query;
  }

  /**
   * @deprecated This repo used in @function getActionTypesData() that are used in action repository.
    The purpose of the @function getActionTypesData()  function is to retrieve data related to action types, providing essential information for handling actions in the action repository.
   */
  private getUserCheckinsQuery(): string {
    const query = gql`
      query ($user_id: uuid!) {
        user_check_ins(where: { user_id: { _eq: $user_id } }) {
          ...user_checkin
        }
      }
      ${userCheckinFragment}
    `;
    return query;
  }

  private getUserCheckinQuery(userId: string): string {
    const query = `SELECT * FROM user_check_ins WHERE user_id = '${userId}';`;
    return query;
  }

  /**
   * @deprecated This repo used in @function getActionsAndUserActions() that are used in action repository.
   The  @function getActionsAndUserActions() function serves the purpose of retrieving a combination of actions and user actions for further processing or analysis within the action repository.
   */

  getUserQuery(): string {
    const query = gql`
      query getUserById($user_id: uuid!) {
        users_by_pk(id: $user_id) {
          ...user
        }
      }
      ${userFragment}
    `;
    return query;
  }

  getUserquery(userId: string): string {
    const query = `SELECT users.* FROM users WHERE id = '${userId}'; `;
    return query;
  }
  /**
   * @deprecated This repo used in @function getActionsAndUserActions() and @function getActionAndUserActions() that are used in action repository.
   The function serves the purpose of retrieving a combination of actions and user actions for further processing or analysis within the action repository.
   */
  private getUserMembershipStagesQuery(): string {
    const query = gql`
      query ($user_id: uuid!) {
        membership_stages: user_membership_stages(
          where: { user_id: { _eq: $user_id } }
        ) {
          ...user_membership_stage
        }
      }
      ${userMembershipStageFragment}
    `;
    return query;
  }

  private getUserMembershipStageQuery(userId: string): string {
    const query = `SELECT
    user_membership_stages.*
  FROM
    user_membership_stages
    JOIN membership_stages ON membership_stages.id = user_membership_stages.membership_stage_id
  where
    user_membership_stages.user_id = '${userId}';`;
    return query;
  }

  /**
   * @deprecated This repo used in @function getaction() that are used in action service.
   * The  @function getaction() function is responsible for retrieving specific action data within the action service.
   */

  async getActionsAndUserActions(userId: string): Promise<{
    actions: Action[];
    user_actions: UserAction[];
    user: User;
    membership_stages: UserMembershipStage[];
  }> {
    const actionsQuery = this.getActionsQuery();
    const userActionsQuery = this.getUserActionsQuery();
    const userQuery = this.getUserQuery();
    const membershipStagesQuery = this.getUserMembershipStagesQuery();
    type result = [
      { data: { actions: Action[] } },
      { data: { user_actions: UserAction[] } },
      { data: { users_by_pk: User } },
      { data: { membership_stages: UserMembershipStage[] } },
    ];
    const requests = [
      { document: actionsQuery, variables: { includTypes: true } },
      { document: userActionsQuery, variables: { user_id: userId } },
      { document: userQuery, variables: { user_id: userId } },
      { document: membershipStagesQuery, variables: { user_id: userId } },
    ];
    const [
      {
        data: { actions },
      },
      {
        data: { user_actions },
      },
      {
        data: { users_by_pk },
      },
      {
        data: { membership_stages },
      },
    ] = await this.client.batchRequests<result>(requests);
    return { actions, user_actions, user: users_by_pk, membership_stages };
  }

  async getActionsAndUserAction(userId: string): Promise<{
    actions: Actions[];
    user_actions: UserAction[];
    user: Users;
    membership_stages: UserMembershipStage[];
  }> {
    const actionsQuery = this.getActionquery();
    const userActionsQuery = this.getUserActionQuery(userId);
    const userQuery = this.getUserquery(userId);
    const membershipStagesQuery = this.getUserMembershipStageQuery(userId);

    const batchQuery =
      actionsQuery + userActionsQuery + userQuery + membershipStagesQuery;
    type T = Actions & UserAction & Users & UserMembershipStage;
    const data = await this.database.batchQuery<T>(batchQuery);

    const [user] = data[2];
    return {
      actions: data[0],
      user_actions: data[1],
      user: user,
      membership_stages: data[3],
    };
  }

  /**
   * @deprecated This repo used in @function getaction() that are used in action service.
   and @function claimAction() that are used in action service.
  The @function getaction() function is responsible for retrieving specific action data within the action service. It enables the service to fetch relevant information about actions for further processing or analysis.
  The @function claimAction()  function, on the other hand, is used to handle the claiming of actions within the action service. It provides the necessary functionality to mark an action as claimed, updating its status accordingly.
   */
  async getActionTypesData(userId: string): Promise<ActionTypesData> {
    const membershipLevelsQuery = this.getUserMembershipLevelsQuery();
    const trophiesQuery = this.getUserTrophiesQuery();
    const checkInsQuery = this.getUserCheckinsQuery();
    const toolkitsQuery = this.getUserScheduleSessionsQuery();
    type result = [
      { data: { user_membership_levels: UserMembershipLevel[] } },
      { data: { user_trophies: UserTrophy[] } },
      { data: { user_schedule_sessions: ScheduleSessionDto[] } },
      { data: { user_check_ins: UserCheckin[] } },
    ];
    const requests: BatchRequestDocument[] = [
      { document: membershipLevelsQuery, variables: { user_id: userId } },
      { document: trophiesQuery, variables: { user_id: userId } },
      { document: toolkitsQuery, variables: { user_id: userId } },
      { document: checkInsQuery, variables: { user_id: userId } },
    ];
    const [
      {
        data: { user_membership_levels },
      },
      {
        data: { user_trophies },
      },
      {
        data: { user_schedule_sessions },
      },
      {
        data: { user_check_ins },
      },
    ] = await this.client.batchRequests<result>(requests);
    return {
      user_membership_levels,
      user_trophies,
      user_schedule_sessions,
      user_check_ins,
    };
  }

  async getActionsTypesData(userId: string): Promise<ActionTypesData> {
    const membershipLevelsQuery = this.getUserMembershipLevelQuery(userId);
    const trophiesQuery = this.getUserTrophieQuery(userId);
    const checkInsQuery = this.getUserCheckinQuery(userId);
    const toolkitsQuery = this.getUserScheduleSessionQuery(userId);

    const batchQuery =
      membershipLevelsQuery + trophiesQuery + checkInsQuery + toolkitsQuery;

    type T = UserMembershipLevel &
      UserTrophy &
      UserCheckin &
      ScheduleSessionDto;

    const data = await this.database.batchQuery<T>(batchQuery);

    return {
      user_membership_levels: data[0],
      user_trophies: data[1],
      user_schedule_sessions: data[3],
      user_check_ins: data[2],
    };
  }

  /**
   * @deprecated Unused Code */
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async addVocherCode(action_id: string, voucher_code: string) {
    const query = gql`
      mutation updateuser_action_vocher_code(
        $action_id: uuid!
        $voucher_code: String!
      ) {
        update_user_actions_by_pk(
          pk_columns: { id: $action_id }
          _set: { voucher_code: $voucher_code }
        ) {
          ...user_action
        }
      }
      ${userActionFragment}
    `;
    const actionInfo = await this.client.request<{
      update_user_actions_by_pk: UserAction;
    }>(query, { action_id, voucher_code });
    return actionInfo.update_user_actions_by_pk;
  }

  /**
   * @deprecated This repo used in @function getActionAndUserActions() that are used in action repository.
    The function serves the purpose of retrieving a combination of actions and user actions for further processing or analysis within the action repository.
   */

  getActionsquery(): string {
    const query = gql`
      query ($action_id: uuid!, $includTypes: Boolean = false) {
        actions(where: { id: { _eq: $action_id } }) {
          ...action
          membership_stage {
            title
            color_code
          }
        }
      }
      ${actionFragment}
    `;
    return query;
  }
  async getActionByActionIdquery(actionId: string): Promise<string> {
    const query = `SELECT
    actions.*,
    COALESCE(
      JSON_AGG(action_check_ins.*) FILTER (
        WHERE
          action_check_ins.action_id IS NOT NULL
      ),
      '[]'
    ) AS action_check_ins,
    COALESCE(
      JSON_AGG(action_levels.*) FILTER (
        WHERE
        action_levels.action_id IS NOT NULL
      ),
      '[]'
    ) AS action_levels,
    COALESCE(
      JSON_AGG(action_tool_kits.*) FILTER (
        WHERE
          action_tool_kits.action_id IS NOT NULL
      ),
      '[]'
    ) AS action_tool_kits,
    COALESCE(
      JSON_AGG(action_trophies.*) FILTER (
        WHERE
          action_trophies.action_id IS NOT NULL
      ),
      '[]'
    ) AS action_trophies,
    COALESCE(
      JSON_AGG(membership_stages.*) FILTER (
        WHERE
          membership_stages.id IS NOT NULL
      ),
      '[]'
    ) AS membership_stage
  FROM
    actions
    LEFT JOIN membership_stages ON membership_stages.id = actions.membership_stage_id
    LEFT JOIN (
      SELECT
        action_check_ins.action_id,
        to_json(check_ins.*) as check_in
      FROM
        action_check_ins
        JOIN check_ins ON check_ins.id = action_check_ins.check_in_id
    ) action_check_ins ON action_check_ins.action_id = actions.id
    LEFT JOIN (
      SELECT
        action_levels.action_id,
       to_json( membership_levels.*) as membership_level
      FROM
        action_levels
        JOIN membership_levels ON membership_levels.id = action_levels.membership_level_id
    ) action_levels ON action_levels.action_id = actions.id
    LEFT JOIN (
      SELECT
        action_tool_kits.action_id,
        to_json(tool_kits.*) as tool_kit
      FROM
        action_tool_kits
        JOIN tool_kits ON tool_kits.id = action_tool_kits.tool_kit_id
    ) action_tool_kits ON action_tool_kits.action_id = actions.id
    LEFT JOIN (
      SELECT
        action_trophies.action_id,
        to_json(trophies.*) as trophy
      FROM
        action_trophies
        JOIN trophies ON trophies.id = action_trophies.trophy_id
    ) action_trophies ON action_trophies.action_id = actions.id
  WHERE
    actions.id = '${actionId}'
  GROUP BY
    actions.id ;`;
    return query;
  }

  /**
   * @deprecated This repo used in @function claimAction() that are used in action service.
   * The @function claimAction() function is responsible for handling the claiming of actions within the action service.
   */
  async getActionAndUserActions(
    userId: string,
    actionId: string,
  ): Promise<{
    actions: Action[];
    user_actions: UserAction[];
    membership_stages: UserMembershipStage[];
  }> {
    const actionsQuery = this.getActionsquery();
    const userActionsQuery = this.getUserActionsQuery();
    // const userQuery = this.getUserQuery();
    const membershipStagesQuery = this.getUserMembershipStagesQuery();
    type result = [
      { data: { actions: Action[] } },
      { data: { user_actions: UserAction[] } },
      { data: { membership_stages: UserMembershipStage[] } },
    ];
    const requests = [
      {
        document: actionsQuery,
        variables: { action_id: actionId, includTypes: true },
      },
      { document: userActionsQuery, variables: { user_id: userId } },
      { document: membershipStagesQuery, variables: { user_id: userId } },
    ];
    const [
      {
        data: { actions },
      },
      {
        data: { user_actions },
      },

      {
        data: { membership_stages },
      },
    ] = await this.client.batchRequests<result>(requests);
    return {
      actions: actions,
      user_actions,
      membership_stages,
    };
  }

  /**
   * @deprecated This repo used in @function claimAction() that are used in action service.
    The @function claimAction() function is responsible for handling the claiming of actions within the action service.
   */
  async saveUserAction(useraction: UserActionDto): Promise<UserAction> {
    const mutation = gql`
      mutation saveUserAction($useraction: user_actions_insert_input!) {
        user_action: insert_user_actions_one(object: $useraction) {
          ...user_action
        }
      }
      ${userActionFragment}
    `;
    const { user_action } = await this.client.request<{
      user_action: UserAction;
    }>(mutation, { useraction });
    return user_action;
  }
  async saveUserActions(useraction: UserActionDto): Promise<UserAction> {
    const parameters = [...Object.values(useraction)];
    const query =
      'INSERT INTO user_actions (' +
      Object.keys(useraction)
        .map((key) => `${key}`)
        .join(', ') +
      ') VALUES (' +
      Object.values(useraction)
        .map((value, index) => `$${index + 1}`)
        .join(', ') +
      ') RETURNING *;';

    const [user_action] = await this.database.query<UserAction>(
      query,
      parameters,
    );

    return user_action;
  }

  async getUserEmail(userId: string): Promise<Users> {
    const query = `SELECT * FROM users where id = $1`;
    const [user] = await this.database.query<Users>(query, [userId]);
    return user;
  }

  async getActionInfo(
    userId: string,
    actionId: string,
  ): Promise<GetActionInfoResponse> {
    const actionInfoQuery = `SELECT actions.*,
    COALESCE(JSON_AGG(action_images.*) FILTER (WHERE action_images.id IS NOT NULL),'[]') AS action_images,
    COALESCE(JSON_AGG(user_actions.*) FILTER (WHERE user_actions.id IS NOT NULL),'[]') AS user_actions
    FROM actions
    LEFT JOIN action_images ON action_images.action_id=actions.id
    LEFT JOIN user_actions ON user_actions.action_id=actions.id AND user_actions.user_id=$1
    WHERE actions.id=$2
    GROUP BY actions.id
    `;
    const [actionInfo] = await this.database.query<GetActionInfoResponse>(
      actionInfoQuery,
      [userId, actionId],
    );
    return actionInfo;
  }
  async getActionAndUserAction(
    userId: string,
    actionId: string,
  ): Promise<{
    actions: Actions[];
    user_actions: UserAction[];
    membership_stage: UserMembershipStage[];
  }> {
    const actionsQuery = await this.getActionByActionIdquery(actionId);
    const userActionsQuery = this.getUserActionQuery(userId);
    const membershipStagesQuery = this.getUserMembershipStageQuery(userId);
    const batchQuery = actionsQuery + userActionsQuery + membershipStagesQuery;

    type T = Actions & UserAction & UserMembershipStage;

    const data = await this.database.batchQuery<T>(batchQuery);

    const result = {
      actions: data[0],
      user_actions: data[1],
      membership_stage: data[2],
    };

    return result;
  }
}
