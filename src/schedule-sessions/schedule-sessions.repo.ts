import { Injectable } from '@nestjs/common';
import { HasuraService } from '../shared/services/hasura/hasura.service';
import { gql } from 'graphql-request';
import {
  GetToolKitSessionsCount,
  MedicationPlan,
  ScheduleSessionDto,
} from './schedule-sessions.dto';
import { Schedule } from '../schedules/schedules.dto';
import { Database } from '../core/modules/database/database.service';
import { HabitTool } from '../schedules/entities/habit-tool.dto';
import { UserScheduleSession } from './entities/user-schedule-sessions.entity';

/**
* @description this Fragment are used in the @function getUserScheduleSessionsQuery() function is used to retrieve the schedule sessions associated with a user, it is used in action repository.
The @function getGoalsHistoryQuery() function is used to fetch the goals history information it is used in goals repository.
The @function getScheduleAndSessionsQuery() function is used to retrieve the schedules and their associated sessions it is used in schedules repository.
The @function addScheduleSession() function is used to add a new session to a schedule service.
*/
export const scheduleSessionFragment = gql`
  fragment schedule_session on user_schedule_sessions {
    id
    user_id
    session_date
    tool_kit_id
    schedule_id
    session_id
    created_at
    updated_at
    challenge_id
    user_toolkit_id
    user_appointment_id
  }
`;

/**
 * @description This fragment is utilized in the @function getMedicationPlansQuery() function within session schedules. It contains the necessary fields and information related to medication plans, allowing for the retrieval of medication-related data for session schedules.
 */
export const medicationPlanFragment = gql`
  fragment medication_plan on medication_tool_kit_info_planned_by_user {
    id
    user_id
    tool_kit_id
    medication
    doses
    stock
    instructions
    created_at
    updated_at
    schedule_id
  }
`;
@Injectable()
export class ScheduleSessionsRepo {
  constructor(
    private readonly client: HasuraService,
    private readonly database: Database,
  ) {}

  /**
   * @description This repository is utilized by the function @function saveScheduleSession() within the schedule-session service. 
     The schedule-session service is responsible for managing the scheduling of sessions. 
     This repository plays a crucial role in storing and retrieving data related to scheduled sessions, providing persistence and data management capabilities to the service.
   */

  async addScheduleSession(
    session: ScheduleSessionDto,
  ): Promise<ScheduleSessionDto> {
    const keys = Object.keys(session);
    const values = Object.values(session);
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    const columns = keys.join(', ');
    const query = `INSERT INTO user_schedule_sessions (${columns}) VALUES (${placeholders}) RETURNING *;`;
    const [newSession] = await this.database.query<ScheduleSessionDto>(
      query,
      values,
    );
    return newSession;
  }

  /**
  * @description This repository is utilized by the @function getToolKitSessionsCount() function within the schedule-session repository. It provides the necessary data access and manipulation functionalities to retrieve the count of toolkit sessions.
  Additionally, the @function getStreaksAndSessions() function in the streaks repository utilizes this repository to fetch the streaks and their associated sessions. It enables the retrieval of streak-related information for further processing and analysis.
  */
  getToolKitSessionsCountQuery() {
    const query = gql`
      query getToolKitSessionsCount($userId: uuid, $toolKitId: uuid!) {
        user_schedule_sessions_aggregate(
          where: {
            _and: [
              { user_id: { _eq: $userId } }
              { tool_kit_id: { _eq: $toolKitId } }
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
   * @deprecated This code is unused and should no longer be used
   */
  async getToolKitSessionsCount(userId: string, toolKitId: string) {
    const query = this.getToolKitSessionsCountQuery();
    const {
      user_schedule_sessions_aggregate: {
        aggregate: { count },
      },
    } = await this.client.request<GetToolKitSessionsCount>(query, {
      userId,
      toolKitId,
    });
    return count;
  }

  // gets medication schedule info planned by user
  /**
   * @description This Repo is utilized by the functions @function getMedicationPlans() within the schedule-session repository.
   */
  /**
   * @description This Repo is utilized by the functions @function addScheduleSession() within the schedule-session service.
   */

  async getMedicationPlans(
    userId: string,
    scheduleId: string,
  ): Promise<MedicationPlan[]> {
    const query = `SELECT * FROM medication_tool_kit_info_planned_by_user WHERE user_id=$1 AND schedule_id=$2`;
    const data = await this.database.query<MedicationPlan>(query, [
      userId,
      scheduleId,
    ]);
    return data;
  }

  // async updates stock for medication tool kit
  /**
   * @description This Repo is utilized by the functions @function addScheduleSession() within the schedule-session service.
   */

  async updateStock(id: string, stock: number): Promise<MedicationPlan> {
    const query = `UPDATE medication_tool_kit_info_planned_by_user SET stock = $1 WHERE id = $2 RETURNING *`;
    const [updatedStock] = await this.database.query<MedicationPlan>(query, [
      stock,
      id,
    ]);
    return updatedStock;
  }

  /**
   * @description This Repo is utilized by the functions @function getScheduleById() within the schedule-session repository.
   */

  /**
   * @description This Repo is utilized by the functions @function addScheduleSession() within the schedule-session service.
   */

  async getScheduleById(scheduleId: string): Promise<Schedule> {
    const query = `SELECT * FROM schedules WHERE id=$1`;
    const [data] = await this.database.query<Schedule>(query, [scheduleId]);
    return data;
  }

  /**
   * @description This Repo is utilized by the functions @function addScheduleSession() within the schedule-session service.
   */

  async isSessionExist(sessionId: string): Promise<boolean> {
    const query = `SELECT * FROM user_schedule_sessions WHERE session_id=$1`;
    const [data] = await this.database.query<UserScheduleSession>(query, [
      sessionId,
    ]);
    return !!data;
  }

  async getHabitTool(dayId: string, toolkitId: string): Promise<HabitTool> {
    const query = `SELECT * FROM habit_tools WHERE day_id=$1 AND habit_tool_kit_id=$2`;
    const [habitTool] = await this.database.query<HabitTool>(query, [
      dayId,
      toolkitId,
    ]);
    return habitTool;
  }
}
