import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { HasuraService } from '../shared/services/hasura/hasura.service';
import { gql } from 'graphql-request';
import {
  Challenge,
  DashboardBlog,
  Schedule,
  ScheduleReminder,
  ScheduleReminderDto,
  ScheduleWithToolkit,
} from './schedules.dto';
import { scheduleSessionFragment } from './../schedule-sessions/schedule-sessions.repo';
import { GoalLevel } from '../goals/goals.dto';
import { goalLevelFragment, userGoalLevelFragment } from '../goals/goals.repo';
import { userFragment } from '../users/users.repo';
import { AgeGroups } from '../users/users.dto';
import { Database } from '../core/modules/database/database.service';
import { Checkin } from '../checkins/entities/check-ins.entity';
import {
  Toolkit,
  ToolkitOptions,
  ToolkitType,
  toolkitAnswerTables,
} from '../toolkits/toolkits.model';
import { QuoteWithImages } from './schedules.model';
import { UserGoal, UserGoalLevels } from '../goals/goals.model';
import { ScheduleSessionDto } from '../schedule-sessions/schedule-sessions.dto';
import { toolKitAnswerFields } from '../checkins/checkins.dto';
import { ScheduleWithAnswers } from './dto/get-dashboard.dto';
import { Users } from '../users/users.model';
import { ServiceOffer } from '../service-offers/entities/service-offer.entity';
import { HabitScheduleWithAnswers } from './dto/get-user-habits.dto';
import { ScheduleEntity, ScheduleFor } from './entities/schedule.entity';
import { HabitTool } from './entities/habit-tools.entity';
import { HabitToolDeletedFromAgenda } from './entities/habit_tools_delete_from_agenda.entity';
import {
  SaveScheduleInput,
  SaveToolkitOptionsInput,
  SaveUserAppointmentInput,
  SaveUserToolkitInput,
} from './dto/create-schedule.dto';
import { UserChallenge } from '../challenges/entities/user-challenge.entity';
import { toolKitOptionTables } from '../toolkits/toolkit.dto';
import { UserScheduleData } from './dto/get-schedule.dto';
import { UserTookit } from '../toolkits/entities/user-toolkits.entity';
import { Treatment } from '@treatments/entities/treatments.entity';
import {
  GetUserCalenderAgendaArgs,
  HabitSchedulesWithSessions,
  SchedulesWithSessions,
} from './dto/get-user-calender-agenda.dto';
import { UserAppointment } from '@toolkits/entities/user-appointment.entity';
import { AgendaFilter } from './dto/get-doctor-calender-agenda.dto';
import { TreatmentTimeline } from '@treatment-timeline/entities/treatment-timeline.entity';
import {
  UpdateToolkitOptionsInput,
  UpdateUserToolkitInput,
  UpdateUserAppointmentInput,
  UpdateSchedulesInput,
} from './dto/update-schedule.dto';

/**
 * @description The following fragments are used in various functions across different repositories:
   @function getScheduleAndSessions() in the challenges repository
   @function getGoalsHistoryQuery() in the goals repository
   @function getScheduleByIdQuery() in the schedule-sessions and toolkits repositories
   @function getScheduleAndSessionsQuery(),getSchedulesByDateQuery(),updateScheduleByIdMutation() and @function getScheduleByIdQuery() in the schedules repository
  However, it is important to note that the functions getScheduleAndSessionsQuery()and getScheduleByIdQuery() in the schedules repositories, respectively, are currently unused code.
 */
export const scheduleFragment = gql`
  fragment schedule on schedules {
    id
    user
    schedule_for
    schedule_type
    start_date
    show_reminder
    schedule_days
    repeat_per_day
    repeat_per_month
    tool_kit
    is_schedule_disabled
    toolKitByToolKit {
      title
    }
    check_in
    checkInByCheckIn {
      title
    }
    challenge_id
    created_at
  }
`;

/**
 * @deprecated Fragment is used in the @function getRemindersByScheduleId() function of the schedules repository, but it is currently unused code.
 */
const reminderFragment = gql`
  fragment reminder on schedule_reminder {
    is_reminder_disabled
    reminder_time
    id
    schedule_id
  }
`;

/**
 *@deprecated Fragment used in @function getToolkitOptionsQuery() in users repository and @function getScheduleAndSessionsQuery() functions in schedules repository both are currently unused code.
 */
export const toolkitFragment = gql`
  fragment toolkit on tool_kits {
    id
    short_description
    image_url
    image_id
    file_path
    title
    tool_kit_type
    tool_kit_category
    tool_kit_hlp_reward_points
    goal_id
    tool_kit_result_screen_image
    unit
  }
`;
export const toolKitUserOptionTables = [
  'sports_tool_kit_option_selected_by_users',
  'alcohol_tool_kit_option_selected_by_users',
  'weight_tool_kit_option_selected_by_users',
  'sleep_tool_kit_option_selected_by_users',
  'step_tool_kit_option_selected_by_users',
  'medication_tool_kit_info_planned_by_users',
] as const;

@Injectable()
export class SchedulesRepo {
  private logger = new Logger(SchedulesRepo.name);
  constructor(
    private readonly client: HasuraService,
    private readonly database: Database,
  ) {}

  /**
   * @deprecated Repository is used in the @function getScheduleAndSessions() function of the schedules repository, but it is currently unused code.
   */
  private getScheduleAndSessionsQuery(): string {
    const query = gql`
      query ($id: uuid!, $start_date: date!, $end_date: date!) {
        schedule: schedules_by_pk(id: $id) {
          ...schedule
          user_schedule_sessions(
            where: {
              _and: [
                { session_date: { _gte: $start_date } }
                { session_date: { _lte: $end_date } }
              ]
            }
            order_by: { created_at: desc }
          ) {
            ...schedule_session
          }
          toolKitByToolKit {
            ...toolkit
          }
        }
      }
      ${scheduleFragment}
      ${toolkitFragment}
      ${scheduleSessionFragment}
    `;
    return query;
  }

  /**
   *@deprecated Repository is used in the @function getGoalLevels() function of the schedules repository, but it is currently unused code.
   */
  private getGoalLevelsQuery(): string {
    const query = gql`
      query ($id: uuid!, $user_id: uuid!) {
        goal_levels(
          where: { goal_id: { _eq: $id } }
          order_by: { sequence_number: desc }
        ) {
          ...goal_level
          goal {
            title
          }
          user_goal_levels(where: { user_id: { _eq: $user_id } }) {
            ...user_goal_Level
          }
        }
      }
      ${goalLevelFragment}
      ${userGoalLevelFragment}
    `;
    return query;
  }

  /**
   *@deprecated This code is unused and should no longer be used.
   */
  async getGoalLevels(id: string, userId: string): Promise<GoalLevel[]> {
    const query = this.getGoalLevelsQuery();
    type result = { goal_levels: GoalLevel[] };
    const { goal_levels } = await this.client.request<result>(query, {
      id,
      user_id: userId,
    });
    return goal_levels;
  }

  /**
   * @deprecated This code is unused and should no longer be used.
   */
  async getScheduleAndSessions(
    id: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Schedule> {
    const query = this.getScheduleAndSessionsQuery();
    type result = { schedule: Schedule };
    const { schedule } = await this.client.request<result>(query, {
      id,
      start_date: startDate,
      end_date: endDate,
    });
    return schedule;
  }

  /**
   *@description This repo are used in @function getSchedulesByDateQuery() in schedules services
   */
  mapToolkitAnswersWithField(): string[] {
    const fragments = [];
    const fields = Object.fromEntries(toolKitAnswerFields);
    for (const toolkitAnswerTable of toolkitAnswerTables.values()) {
      if (fields[toolkitAnswerTable]) {
        const fragment = `${toolkitAnswerTable}(where:{session_date:{_eq:$date}},order_by:{session_date:desc}){${fields[
          toolkitAnswerTable
        ]
          .split(',')
          .join(' ')},session_time}`;
        fragments.push(fragment);
      }
    }
    return fragments;
  }

  /**
   *@description This repo are used in @function getSchedulesAndBlogs() in schedules repository that  used for testing purpose in user controller
   */
  private getUserQuery(): string {
    const query = gql`
      query ($user_id: uuid!) {
        user: users_by_pk(id: $user_id) {
          ...user
        }
      }
      ${userFragment}
    `;
    return query;
  }

  /**
   * @deprecated repository is used in the @function getRemindersByScheduleId() function of the schedules repository, but it is currently unused code.
   */
  private getRemindersByScheduleIdQuery(): string {
    const query = gql`
      query ($id: uuid!) {
        schedule_reminders(where: { schedule_id: { _eq: $id } }) {
          ...reminder
        }
      }
      ${reminderFragment}
    `;
    return query;
  }

  /**
   * @deprecated This code is unused and should no longer be used.
   */
  async getRemindersByScheduleId(id: string): Promise<ScheduleReminder[]> {
    const quey = this.getRemindersByScheduleIdQuery();
    type result = { schedule_reminders: ScheduleReminder[] };
    const { schedule_reminders } = await this.client.request<result>(quey, {
      id,
    });
    return schedule_reminders;
  }

  /**
   * @deprecated This code is unused and should no longer be used.
   */
  addScheduleMutation(): string {
    const mutation = gql`
      mutation ($schedule: schedules_insert_input!) {
        insert_schedules_one(
          on_conflict: {
            constraint: schedules_pkey
            update_columns: [
              user
              check_in
              tool_kit
              schedule_for
              schedule_type
              start_date
              show_reminder
              repeat_per_day
              schedule_days
              repeat_per_month
              is_schedule_disabled
              challenge_id
            ]
          }
          object: $schedule
        ) {
          id
        }
      }
    `;
    return mutation;
  }

  /**
   * @deprecated This code is unused and should no longer be used.
   */
  addRemindersMutation(): string {
    const mutation = gql`
      mutation ($reminders: [schedule_reminders_insert_input!]!) {
        insert_schedule_reminders(
          on_conflict: {
            constraint: schedule_reminders_pkey
            update_columns: [
              is_reminder_disabled
              reminder_time
              schedule_id
              user_id
            ]
          }
          objects: $reminders
        ) {
          affected_rows
        }
      }
    `;
    return mutation;
  }

  /**
   * @description This repository is used in the @function completeSchedule() function of the schedules repository.
   */
  private updateScheduleByIdMutation(): string {
    const mutation = gql`
      mutation ($id: uuid!, $updates: schedules_set_input!) {
        update_schedules_by_pk(pk_columns: { id: $id }, _set: $updates) {
          ...schedule
        }
      }
      ${scheduleFragment}
    `;
    return mutation;
  }

  /**
   * @description This repository is used in the @function checkSchedule() function of the schedules repository.
   */
  async completeSchedule(id: string): Promise<Schedule> {
    const mutation = this.updateScheduleByIdMutation();
    type result = { schedule: Schedule };
    const { schedule } = await this.client.request<result>(mutation, {
      id,
      updates: { is_completed: true },
    });
    return schedule;
  }

  async getSchedule(id: string): Promise<ScheduleWithToolkit> {
    const query = `SELECT schedules.*,row_to_json(tool_kits.*) AS toolkit FROM schedules
    LEFT JOIN tool_kits ON tool_kits.id=schedules.tool_kit
    WHERE schedules.id=$1 `;
    const [schedule] = await this.database.query<ScheduleWithToolkit>(query, [
      id,
    ]);
    return schedule;
  }

  async deleteScheduleReminders(
    scheduleId: string,
  ): Promise<ScheduleReminder[]> {
    const query = `DELETE FROM schedule_reminders WHERE schedule_id=$1 RETURNING *; `;
    const reminders = await this.database.query<ScheduleReminder>(query, [
      scheduleId,
    ]);
    return reminders;
  }

  async addScheduleReminders(
    reminders: ScheduleReminderDto[],
  ): Promise<ScheduleReminder[]> {
    const query = reminders
      .map((reminder) => {
        return `INSERT INTO schedule_reminders (user_id,schedule_id,reminder_time) VALUES ('${reminder.user_id}','${reminder.schedule_id}','${reminder.reminder_time}') RETURNING *;`;
      })
      .join('');
    const newReminders = await this.database.batchQuery<ScheduleReminder>(
      query,
    );
    return newReminders.map((reminder) => reminder[0]);
  }

  async getRemindersByScheduelId(id: string): Promise<ScheduleReminder[]> {
    const query = `SELECT * FROM schedule_reminders WHERE schedule_id=$1`;
    const reminders = await this.database.query<ScheduleReminder>(query, [id]);
    return reminders;
  }
  async getUser(userId: string): Promise<Users> {
    const query = `
    SELECT * FROM users WHERE id=$1;
    `;
    const [user] = await this.database.query<Users>(query, [userId]);
    return user;
  }
  async getBlogs(
    userId: string,
    age_group: AgeGroups,
  ): Promise<DashboardBlog[]> {
    const query = `
    SELECT blog_posts.*,
    CASE
    WHEN blog_posts.id=user_blog_reads.blog_id THEN true ELSE false END AS is_read
    FROM blog_posts
    LEFT JOIN user_blog_reads ON user_blog_reads.blog_id=blog_posts.id AND user_blog_reads.user_id=$1
    WHERE (blog_posts.age_group=$2 OR blog_posts.age_group IS NULL) AND blog_posts.blog_type != 'QUOTE' AND blog_posts.is_deleted = $3
    `;
    const blogs = await this.database.query<DashboardBlog>(query, [
      userId,
      age_group,
      false,
    ]);
    return blogs;
  }

  async getCheckInByScheduleId(
    schduleId: string,
    userId: string,
  ): Promise<Checkin> {
    const query = `SELECT check_ins.* FROM schedules
    LEFT JOIN check_ins ON schedules.check_in = check_ins.id
    WHERE schedules.id = $1 AND schedules.check_in IS NOT NULL AND schedules.user =$2;`;
    const [checkIn] = await this.database.query<Checkin>(query, [
      schduleId,
      userId,
    ]);
    return checkIn;
  }

  async getToolKitBySchedule(
    schduleId: string,
    userId: string,
  ): Promise<Toolkit> {
    const query = `SELECT tool_kits.* FROM schedules
    LEFT JOIN tool_kits ON schedules.tool_kit = tool_kits.id
    WHERE schedules.id = $1 AND schedules.tool_kit IS NOT NULL AND schedules.user=$2;`;
    const [checkIn] = await this.database.query<Toolkit>(query, [
      schduleId,
      userId,
    ]);
    return checkIn;
  }

  async getQuotes(date: string): Promise<QuoteWithImages[]> {
    const query = `
    SELECT quotes.*, json_agg(quote_images) AS images FROM quote_dates
    LEFT JOIN quotes ON quotes.id=quote_dates.quote_id
    JOIN quote_images ON quote_images.quote_id=quotes.id
    WHERE quote_dates.date=$1
    GROUP BY quotes.id
    `;
    const quotes = await this.database.query<QuoteWithImages>(query, [date]);
    return quotes;
  }

  async getUserScheduleSessionsByDateRange(
    scheduleId: string,
    startDate: string,
    endDate: string,
    tableName: string,
  ): Promise<ScheduleSessionDto[]> {
    const query = `SELECT * FROM ${tableName} WHERE schedule_id=$1 AND session_date BETWEEN $2 AND $3`;
    const sessions = await this.database.query<ScheduleSessionDto>(query, [
      scheduleId,
      startDate,
      endDate,
    ]);
    return sessions;
  }

  async getUserGoalLevelsByGoalId(
    userId: string,
    goalId: string,
  ): Promise<UserGoalLevels[]> {
    const query = `SELECT goal_levels.*,goals.title AS goal_title,
    CASE
    WHEN goal_levels.id = user_goal_levels.goal_level_id THEN true ELSE false END AS is_completed
    FROM goal_levels
    LEFT JOIN user_goal_levels ON user_goal_levels.goal_level_id = goal_levels.id AND user_goal_levels.user_id = $1
    JOIN goals ON goals.id=goal_levels.goal_id
    WHERE goal_levels.goal_id = $2
    ORDER BY goal_levels.sequence_number ASC;`;
    const userGoalLevels = await this.database.query<UserGoalLevels>(query, [
      userId,
      goalId,
    ]);
    return userGoalLevels;
  }

  async getToolKitById(toolkitId: string): Promise<Toolkit> {
    const query = `SELECT * FROM tool_kits WHERE id=$1`;
    const [checkIn] = await this.database.query<Toolkit>(query, [toolkitId]);
    return checkIn;
  }

  private scheduleGoalJoins(): {
    query: string;
    columm: string;
  } {
    const { joins, column } = Array.from(toolKitUserOptionTables)
      .map((name) => name.slice(0, name.length - 1))
      .reduce(
        (agg, tableName) => {
          agg.joins += `LEFT JOIN ${tableName}  ON ${tableName}.schedule_id=schedules.id
        `;
          agg.column += `WHEN ${tableName}.schedule_id=schedules.id THEN ${tableName}.id
          `;
          return agg;
        },
        {
          joins: '',
          column: `
        `,
        },
      );
    const finalColumn = `CASE
      ${column}
      ELSE NULL END AS goal_id
      `;
    return { query: joins, columm: finalColumn };
  }

  private scheduleAnswerJoins(): {
    query: string;
    columm: string;
  } {
    const checkins = [
      ToolkitType.STEPS,
      ToolkitType.SLEEP_CHECK,
      ToolkitType.BLOOD_PRESSURE,
      ToolkitType.HEART_RATE,
      ToolkitType.WEIGHT,
      ToolkitType.MEDICATION,
      ToolkitType.MOOD,
      ToolkitType.ADDICTION_LOG,
      ToolkitType.SYMPTOMS_LOG,
      ToolkitType.EMOTION_SYMPTOMS_LOG,
      ToolkitType.ANXIETY_SYMPTOMS_LOG,
      ToolkitType.SUSPICIUS_SYMPTOMS_LOG,
      ToolkitType.HYPER_ACTIVITY_SYMPTOMS_LOG,
      ToolkitType.FORCED_ACTION_SYMPTOMS_LOG,
    ];
    const { joins, column } = checkins.reduce(
      (agg, checkin) => {
        const tableName = toolkitAnswerTables.get(checkin);
        if (tableName) {
          if (checkin !== ToolkitType.MOOD) {
            agg.joins += `
        LEFT JOIN (
            SELECT schedule_id,MIN(session_time) AS session_time,json_agg(${tableName}.*) AS answers FROM ${tableName} WHERE session_date=$1::date GROUP BY schedule_id ORDER BY session_time DESC
          ) ${tableName} ON ${tableName}.schedule_id=schedules.id
        `;
          }

          if (checkin === ToolkitType.MOOD) {
            agg.joins += `
            LEFT JOIN (
                SELECT schedule_id,MIN(session_time) AS session_time,json_agg(
                    json_build_object('answer',${tableName}.*,'mood_check_category',mood_check_categories.*)) AS answers  FROM ${tableName}
                JOIN mood_check_categories ON mood_check_categories.id=${tableName}.mood_category_id
                WHERE session_date=$1::date GROUP BY schedule_id ORDER BY session_time DESC
              ) ${tableName} ON ${tableName}.schedule_id=schedules.id
            `;
          }

          agg.column += `WHEN ${tableName}.schedule_id=schedules.id THEN ${tableName}.answers
          `;
        }
        return agg;
      },
      { joins: '', column: '' },
    );
    const finalColumn = `CASE
    ${column}
    ELSE NULL END AS entries
    `;
    return { query: joins, columm: finalColumn };
  }

  private getUserAppointmentJoin(): string {
    return ` LEFT JOIN LATERAL (
      SELECT
  user_appointments.*,
  ROW_TO_JSON(doctor.*) AS doctor,
  ROW_TO_JSON(users.*) AS users,
  COALESCE(
    (
      SELECT
        JSON_AGG(forms.*)
      FROM
        (
          SELECT
            forms.id,
            forms.hlp_reward_points,
            CASE
              WHEN forms.id = schedules.session_form_id
              THEN true
              ELSE false
              END AS is_session_form,
              CASE
              WHEN forms.id = schedules.complaint_form_id
              THEN true
              ELSE false
              END AS is_complaint_form,
            CASE
              WHEN forms.translations->> 'en' IS NOT NULL
              THEN (forms.translations->> 'en' )::json->>'title'
              ELSE forms.title
              END AS title,
            CASE
              WHEN user_form_answers.id IS NOT NULL THEN true
              ELSE false
            END AS is_completed
          FROM
            forms
            LEFT JOIN user_form_answers ON user_form_answers.form_id = forms.id
            AND user_form_answers.schedule_id = schedules.id  
            AND user_form_answers.user_appointment_id = schedules.user_appointment_id
            AND user_form_answers.session_date = $1 
          WHERE
            forms.id = schedules.session_form_id 
            OR forms.id = schedules.complaint_form_id 
          ORDER BY
            forms.created_at DESC ---fix sorting later
        ) AS forms
    ),
    '[]'
  ) AS appointment_forms
FROM
  user_appointments
  LEFT JOIN LATERAL (
    SELECT
      users.id,
      users.avatar_image_name,
      users.avatar,
      users.user_name,
      users.first_name,
      users.last_name,
      users.role
    FROM
      users
    WHERE
      user_appointments.user_id = users.id
  ) AS users ON true
  LEFT JOIN LATERAL (
    SELECT
      users.id,
      users.image_url,
      users.image_id,
      users.user_name,
      users.first_name,
      users.last_name,
      users.role,
      users.file_path
    FROM
      users
    WHERE
      user_appointments.doctor_id = users.id
  ) AS doctor ON true
WHERE
  user_appointments.id = schedules.user_appointment_id
    ) AS user_appointment ON true`;
  }

  get scheduleWithAnswersQuery(): string {
    const { query: scheduleGoalJoins, columm: scheduleGoalColumn } =
      this.scheduleGoalJoins();
    const { query: scheduleAnswerJoins, columm: scheduleAnswerColumn } =
      this.scheduleAnswerJoins();
    const userAppointmentJoin = this.getUserAppointmentJoin();

    const query = `
    SELECT schedules.*,schedules.repeat_per_day AS total_sessions,
    COALESCE(completed_sessions,0)::INTEGER as completed_sessions,
    COALESCE(schedule_reminders.reminders,'[]') AS reminders,
    COALESCE(toolkit_streaks.streaks_count,0)::INTEGER AS streaks_count,
    row_to_json(tool_kits.*) AS toolkit,
    row_to_json(challenges.*) As challenge,
    user_schedule_sessions.session_id,
    row_to_json(user_appointment) As user_appointment,
    COALESCE(user_form_answers.form_session_ids, '[]') AS form_session_ids,

    -- completed
    CASE
    WHEN completed_sessions>=repeat_per_day THEN true ELSE false
    END AS completed,

    -- last session id
    CASE
    WHEN completed_sessions >= repeat_per_day THEN 
        (SELECT session_id 
         FROM user_schedule_sessions 
         WHERE session_date = $1::date 
           AND user_schedule_sessions.schedule_id = schedules.id 
         ORDER BY created_at DESC 
         LIMIT 1)
    ELSE NULL
    END AS last_session_id,

    -- goal_id(selected options)
    ${scheduleGoalColumn},

    -- toolkit answers
    ${scheduleAnswerColumn}

    FROM schedules

    -- toolkits with unit
    LEFT JOIN (SELECT tool_kits.*,row_to_json(units.*) As unit FROM tool_kits JOIN units ON units.id=tool_kits.unit
    ) tool_kits ON tool_kits.id=schedules.tool_kit AND tool_kits.tool_kit_type!='${ToolkitType.HABIT}'

    -- streaks
    LEFT JOIN(SELECT tool_kit,count(toolkit_streaks.*) AS streaks_count FROM toolkit_streaks  GROUP BY tool_kit) toolkit_streaks ON toolkit_streaks.tool_kit=schedules.tool_kit

    -- challenge
    LEFT JOIN challenges ON schedules.challenge_id IS NOT NULL AND schedules.challenge_id=challenges.id

    -- reminders
    LEFT JOIN (SELECT schedule_id,json_agg(schedule_reminders.*) AS reminders FROM schedule_reminders GROUP BY schedule_id) schedule_reminders ON schedule_reminders.schedule_id=schedules.id

    -- schedule sessions
    LEFT JOIN (SELECT schedule_id,MAX(created_at) AS created_at,MAX(id::text) as session_id, COUNT(*) as completed_sessions FROM user_schedule_sessions WHERE session_date=$1::date GROUP BY schedule_id) user_schedule_sessions ON user_schedule_sessions.schedule_id=schedules.id

    -- options joins
    ${scheduleGoalJoins}

    -- answer joins
    ${scheduleAnswerJoins}

    -- user_appointments
    ${userAppointmentJoin}

    -- form_session_ids
    LEFT JOIN LATERAL( SELECT JSON_AGG(user_form_answers.session_id) AS form_session_ids FROM user_form_answers WHERE user_form_answers.schedule_id = schedules.id AND user_form_answers.session_date = $1 ) AS user_form_answers ON true `;

    return query;
  }

  private habitScheduleAnswerJoins(): {
    query: string;
    columm: string;
  } {
    const checkins = [
      ToolkitType.STEPS,
      ToolkitType.SLEEP_CHECK,
      ToolkitType.BLOOD_PRESSURE,
      ToolkitType.HEART_RATE,
      ToolkitType.WEIGHT,
      ToolkitType.MEDICATION,
      ToolkitType.MOOD,
    ];
    const { joins, column } = checkins.reduce(
      (agg, checkin) => {
        const tableName = toolkitAnswerTables.get(checkin);
        if (tableName) {
          if (checkin !== ToolkitType.MOOD) {
            agg.joins += `
        LEFT JOIN (
            SELECT schedule_id,MIN(tool_kit_id::text) AS tool_kit_id,MIN(day_id::text) AS day_id,MIN(session_time) AS session_time,json_agg(${tableName}.*) AS answers FROM ${tableName} WHERE session_date=$1::date GROUP BY schedule_id ORDER BY session_time DESC
          ) ${tableName} ON ${tableName}.schedule_id=schedules.id AND ${tableName}.day_id=habit_days.id::text AND habit_tools.habit_tool_kit_id::text=${tableName}.tool_kit_id
        `;
          }

          if (checkin === ToolkitType.MOOD) {
            agg.joins += `
            LEFT JOIN (
                SELECT schedule_id,MIN(tool_kit_id::text) AS tool_kit_id ,MIN(day_id::text) AS day_id,MIN(session_time) AS session_time,json_agg(
                    json_build_object('answer',${tableName}.*,'mood_check_category',mood_check_categories.*)) AS answers  FROM ${tableName}
                JOIN mood_check_categories ON mood_check_categories.id=${tableName}.mood_category_id
                WHERE session_date=$1::date GROUP BY schedule_id ORDER BY session_time DESC
              ) ${tableName} ON ${tableName}.schedule_id=schedules.id AND ${tableName}.day_id=habit_days.id::text AND habit_tools.habit_tool_kit_id::text=${tableName}.tool_kit_id
            `;
          }

          agg.column += `WHEN ${tableName}.schedule_id=schedules.id THEN ${tableName}.answers
          `;
        }
        return agg;
      },
      { joins: '', column: '' },
    );
    const finalColumn = `CASE
    ${column}
    ELSE NULL END AS entries
    `;
    return { query: joins, columm: finalColumn };
  }

  get habitToolsQuery(): string {
    const { query: scheduleGoalJoins, columm: scheduleGoalColumn } =
      this.scheduleGoalJoins();
    const { query: scheduleAnswerJoins, columm: scheduleAnswerColumn } =
      this.habitScheduleAnswerJoins();

    const query = `
    SELECT schedules.*,row_to_json(tool_kits.*) AS toolkit,
    row_to_json(habit_tool) AS habit_tool,
    row_to_json(habit_days) AS habit_day,
    row_to_json(habit_tools) AS habit_tools,
    row_to_json(user_schedule_sessions) As user_schedule_sessions,
    COALESCE(user_schedule_sessions.completed_sessions,0):: int AS completed_sessions,
    user_schedule_sessions.session_id,
    tool_kits.habit_duration as total_sessions,
    COALESCE(schedule_reminders.reminders,'[]') AS reminders,
    COALESCE(toolkit_streaks.streaks_count,0)::INTEGER AS streaks_count,
    habit_tools.id as habit_tool_id,

    -- completed
    CASE
    WHEN completed_sessions>=1 THEN true ELSE false
    END AS completed,

    -- goal_id(selected options)
    ${scheduleGoalColumn},

    -- toolkit answers
    ${scheduleAnswerColumn}

    FROM
  schedules
  JOIN tool_kits ON tool_kits.id = schedules.tool_kit
  AND tool_kits.tool_kit_type = 'HABIT' -- habit tools
  JOIN habit_days ON habit_days.tool_kit_id = tool_kits.id
  AND habit_days.day = (EXTRACT(DAY FROM ($1 - schedules.start_date)) + 1)
  JOIN  (
    SELECT habit_tools.id,
    MIN(habit_tools.habit_tool_kit_id::text) AS habit_tool_kit_id,
    MIN(habit_tools.day_id::text) AS day_id,
    COALESCE(array_agg(habit_tools_deleted_from_agenda.schedule_id) FILTER (WHERE habit_tools_deleted_from_agenda.schedule_id IS NOT NULL ),'{}') AS schedules
    FROM
    habit_tools
    LEFT JOIN habit_tools_deleted_from_agenda ON habit_tools_deleted_from_agenda.user_id = $2 AND habit_tools.id=habit_tools_deleted_from_agenda.habit_id
    GROUP BY habit_tools.id
  )  habit_tools ON habit_tools.day_id = habit_days.id::text AND NOT(schedules.id=ANY(habit_tools.schedules))

  -- toolkits with unit
  JOIN (
    SELECT
      tool_kits.*,
      row_to_json(units.*) As unit
    FROM
      tool_kits
      JOIN units ON units.id = tool_kits.unit
  ) habit_tool ON habit_tool.id::text = habit_tools.habit_tool_kit_id

  -- sessions
  LEFT JOIN (
    SELECT
    habit_tool_id,
    COALESCE(array_agg(schedule_id) FILTER (WHERE schedule_id IS NOT NULL ),'{}') AS schedules,
      MAX(created_at) AS created_at,
      MAX(id :: text) as session_id,
      COUNT(*) as completed_sessions
    FROM
      user_schedule_sessions
    WHERE
      session_date = $1 :: date AND habit_tool_id IS NOT NULL
    GROUP BY
    habit_tool_id
    ORDER BY
      created_at
  ) user_schedule_sessions ON user_schedule_sessions.habit_tool_id=habit_tools.id
  AND schedules.id=ANY(user_schedule_sessions.schedules)

  -- streaks
    LEFT JOIN(SELECT tool_kit,count(toolkit_streaks.*) AS streaks_count FROM toolkit_streaks  GROUP BY tool_kit) toolkit_streaks ON toolkit_streaks.tool_kit=schedules.tool_kit

  -- reminders
  LEFT JOIN (
    SELECT
      schedule_id,
      json_agg(schedule_reminders.*) AS reminders
    FROM
      schedule_reminders
    GROUP BY
      schedule_id
  ) schedule_reminders ON schedule_reminders.schedule_id = schedules.id

    -- options joins
   ${scheduleGoalJoins}

  -- answer joins
  ${scheduleAnswerJoins} `;

    return query;
  }

  async getSchedulesWithAnswers(
    userId: string,
    dateString: string,
    weekDay: string,
    day: number,
    page: number,
    limit: number,
    filters?: AgendaFilter,
  ): Promise<{
    total: number;
    scheduleWithAnswers: ScheduleWithAnswers[];
  }> {
    const offset = (page - 1) * limit;

    //TODO:for now we are converting to date only we will fix the timestamp issue later
    let baseCondition = `
    WHERE schedules.user=$2
    AND (
      (schedules.is_schedule_disabled = false AND schedules.start_date::date <= $1 ::date)
      OR (schedules.is_schedule_disabled = true AND schedules.end_date IS NOT NULL AND schedules.end_date::date > $1 ::date)
    )
    AND (
      $3 = ANY(repeat_per_month)
      OR $4 = ANY(schedule_days)
      OR schedules.schedule_type = 'DAILY'
      OR (schedules.schedule_type = 'ONETIME' AND schedules.start_date::date = $1 ::date)
    )`;

    if (filters) {
      const filterConditions: string[] = [];

      if (filters.show_activity) {
        const placeHolders = ScheduleFor.USER_TOOLKIT;
        filterConditions.push(`schedules.schedule_for = '${placeHolders}'`);
      }

      if (filters.show_appointment) {
        const placeHolders = ScheduleFor.APPOINTMENT;
        filterConditions.push(`schedules.schedule_for = '${placeHolders}'`);
      }

      if (filterConditions.length) {
        baseCondition += ` AND (${filterConditions.join(' OR ')})`;
      }
    }

    const queryWithoutPagination = `SELECT COALESCE(count(schedules.id),0) As total FROM schedules ${baseCondition} `;

    const query = `${this.scheduleWithAnswersQuery} ${baseCondition}
      ORDER BY completed , created_at DESC
      OFFSET $5
      LIMIT $6 `;

    const [scheduleWithAnswers, [{ total }]] = await Promise.all([
      this.database.query<ScheduleWithAnswers>(query, [
        dateString,
        userId,
        day,
        weekDay,
        offset,
        limit,
      ]),

      this.database.query<{ total: number }>(queryWithoutPagination, [
        dateString,
        userId,
        day,
        weekDay,
      ]),
    ]);

    return { total, scheduleWithAnswers };
  }

  async getHabitTools(
    userId: string,
    dateString: string,
    page: number,
    limit: number,
  ): Promise<{
    total: number;
    habitsScheduleWithAnswers: HabitScheduleWithAnswers[];
  }> {
    const offset = (page - 1) * limit;

    //TODO:for now we are converting to date only we will fix the timestamp issue later
    const baseCondition = `WHERE schedules.user=$2
    AND (
      (schedules.is_schedule_disabled = false AND schedules.start_date::date <= $1 ::date)
      OR (schedules.is_schedule_disabled = true AND schedules.end_date IS NOT NULL AND schedules.end_date::date > $1 ::date )
    )`;

    const query = `${this.habitToolsQuery} ${baseCondition} ORDER BY completed OFFSET $3 LIMIT $4 `;

    const queryWithoutPagination = `SELECT COALESCE(count(schedules.id),0) As total
    FROM schedules
      JOIN tool_kits ON tool_kits.id=schedules.tool_kit AND tool_kits.tool_kit_type='${ToolkitType.HABIT}'

      -- habit tools
      JOIN (
         SELECT habit_days.* FROM habit_days
         WHERE habit_days.id NOT IN
         (SELECT day_id FROM habit_tools_deleted_from_agenda WHERE habit_tools_deleted_from_agenda.user_id=$2)
        ) habit_days ON habit_days.tool_kit_id=tool_kits.id 
      AND habit_days.day = (EXTRACT(DAY FROM ($1 - schedules.start_date)) + 1)
      JOIN habit_tools ON habit_tools.day_id=habit_days.id 

    -- base condition
    ${baseCondition} `;

    const [habitsScheduleWithAnswers, [{ total }]] = await Promise.all([
      this.database.query<HabitScheduleWithAnswers>(query, [
        dateString,
        userId,
        offset,
        limit,
      ]),
      this.database.query<{ total: number }>(queryWithoutPagination, [
        dateString,
        userId,
      ]),
    ]);
    return { total, habitsScheduleWithAnswers };
  }

  async getScheduleWithAnswer(
    date: string,
    scheduleId: string,
  ): Promise<ScheduleWithAnswers | null> {
    const query = `${this.scheduleWithAnswersQuery} WHERE schedules.id = $2 `;

    const [scheduleWithAnswer] = await this.database.query<ScheduleWithAnswers>(
      query,
      [date, scheduleId],
    );

    return scheduleWithAnswer;
  }

  async getHabitScheduleWithAnswer(
    date: string,
    schduleId: string,
  ): Promise<HabitScheduleWithAnswers | null> {
    const query = `${this.habitToolsQuery} WHERE schedules.id = $2 `;

    const [habitScheduleWithAnswer] =
      await this.database.query<HabitScheduleWithAnswers>(query, [
        date,
        schduleId,
      ]);

    return habitScheduleWithAnswer;
  }

  async getServiceOffersAndChallenges(
    date: string,
  ): Promise<{ challenges: Challenge[]; serviceOffers: ServiceOffer[] }> {
    const query = `SELECT challenges.*, row_to_json(tool_kits.*) AS tool_kit FROM challenges
    JOIN tool_kits ON tool_kits.id=challenges.tool_kit_id
     WHERE challenge_start_date<='${date}' AND challenge_end_date >='${date}' AND is_challenge_completed=false ORDER BY created_at DESC LIMIT 1;
     SELECT * FROM service_offers WHERE show_offer_in_dashboard=true
     `;
    const data = await this.database.batchQuery(query);
    const challenges = data[0] as Challenge[];
    const serviceOffers = data[1] as ServiceOffer[];
    return { challenges, serviceOffers };
  }

  async getScheduleById<T>(scheduleId: string): Promise<T> {
    const query = `SELECT * FROM schedules WHERE schedules.id=$1`;
    const [schedule] = await this.database.query<T>(query, [scheduleId]);
    return schedule;
  }

  async disableSchedule(
    scheduleId: string,
    date: string,
    logedInUser: string,
  ): Promise<ScheduleEntity> {
    const query = `UPDATE schedules SET is_schedule_disabled=$1, end_date=$2, updated_by=$3  WHERE schedules.id=$4 RETURNING *`;
    const [schedule] = await this.database.query<ScheduleEntity>(query, [
      true,
      date,
      logedInUser,
      scheduleId,
    ]);
    return schedule;
  }

  async getHabitTool(habitToolId: string): Promise<HabitTool> {
    const query = `SELECT * FROM habit_tools WHERE habit_tools.id=$1`;
    const [habitTool] = await this.database.query<HabitTool>(query, [
      habitToolId,
    ]);
    return habitTool;
  }

  async saveHabitToolDeletedFromAgenda(
    userId: string,
    habitToolId: string,
    dayId: string,
    scheduleId: string,
  ): Promise<HabitToolDeletedFromAgenda> {
    const query = `INSERT INTO habit_tools_deleted_from_agenda(user_id, habit_id, day_id,schedule_id)
    VALUES ($1, $2, $3,$4) RETURNING *`;
    const [habitToolDeletedFromAgenda] =
      await this.database.query<HabitToolDeletedFromAgenda>(query, [
        userId,
        habitToolId,
        dayId,
        scheduleId,
      ]);
    return habitToolDeletedFromAgenda;
  }

  async getUserGoalByGoal(userId: string, goalId: string): Promise<UserGoal> {
    const query = `SELECT * FROM user_goals WHERE user_id=$1 AND goal=$2`;
    const [userGoal] = await this.database.query<UserGoal>(query, [
      userId,
      goalId,
    ]);
    return userGoal;
  }

  async getActiveChallengeById(challengeId: string): Promise<Challenge> {
    const query = `SELECT * FROM challenges WHERE id = $1 AND is_challenge_completed = $2`;
    const [challenge] = await this.database.query<Challenge>(query, [
      challengeId,
      'false',
    ]);
    return challenge;
  }

  async saveSchedules(
    saveSchedules: SaveScheduleInput[],
  ): Promise<ScheduleEntity[]> {
    const keys = Object.keys(saveSchedules[0]);
    const columns = keys
      .map((key) => (key === 'user' ? `"${key}"` : key))
      .join(', ');
    const values = saveSchedules
      .map((schedule) => {
        const mappedValues = Object.values(schedule).map((value) => {
          // If value is undefined, replace it with 'NULL'
          if (value === undefined) {
            return 'NULL';
          }
          // If value is an array, format it as '{value1,value2,value3}'
          if (Array.isArray(value)) {
            return `'${'{' + value.join(',') + '}'}'`;
          }
          return `'${value}'`;
        });
        return `(${mappedValues.join(', ')})`;
      })
      .join(', ');
    const query = `INSERT INTO schedules (${columns}) VALUES ${values} RETURNING *`;
    const schedules = await this.database.batchQuery<ScheduleEntity>(query);
    return schedules.flat();
  }

  async saveUserToolkit(input: SaveUserToolkitInput): Promise<UserTookit> {
    const keys = Object.keys(input);
    const values = Object.values(input);
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    const columns = keys.join(', ');

    const query = `INSERT INTO user_toolkits (${columns}) VALUES (${placeholders}) RETURNING *;`;
    const [userToolkit] = await this.database.query<UserTookit>(query, values);
    return userToolkit;
  }

  async getActiveChallengeSchedule(
    challengeId: string,
    userId: string,
  ): Promise<ScheduleEntity> {
    const query = `SELECT * FROM schedules
        WHERE schedules.user = $1 AND schedules.challenge_id = $2
        AND ( schedules.is_schedule_disabled = false
         OR ( schedules.is_schedule_disabled = true AND NOW() BETWEEN schedules.start_date AND schedules.end_date ) )`;
    const [schedule] = await this.database.query<ScheduleEntity>(query, [
      challengeId,
      userId,
    ]);
    return schedule;
  }

  async saveUserChallenge(
    userId: string,
    challengeId: string,
  ): Promise<UserChallenge> {
    const query = `INSERT INTO user_challenges (user_id, challenge_id) VALUES ($1 , $2)
     ON CONFLICT (user_id, challenge_id) DO NOTHING RETURNING *;`;
    const [userchallenge] = await this.database.query<UserChallenge>(query, [
      userId,
      challengeId,
    ]);
    this.logger.log(`User Challenge Created, id:${userchallenge.id}`);
    return userchallenge;
  }

  async getActiveScheduleById<T>(scheduleId: string): Promise<T> {
    const query = `SELECT * FROM schedules
    WHERE schedules.id = $1 AND ( schedules.is_schedule_disabled = false
     OR ( schedules.is_schedule_disabled = true AND NOW() BETWEEN schedules.start_date AND schedules.end_date ) )`;
    const [schedule] = await this.database.query<T>(query, [scheduleId]);
    return schedule;
  }

  async getToolkitOptions(
    optionId: string,
    toolkitType: ToolkitType,
  ): Promise<ToolkitOptions> {
    const tableName = toolKitOptionTables.get(toolkitType);
    if (!tableName) {
      throw new NotFoundException('toolkit option table name not found');
    }
    const query = `SELECT * FROM ${tableName} WHERE ${tableName}.id=$1`;
    const [toolkitOption] = await this.database.query<ToolkitOptions>(query, [
      optionId,
    ]);
    return toolkitOption;
  }

  async saveSelectedToolkitOption(
    input: SaveToolkitOptionsInput,
    tableName: string,
  ): Promise<ToolkitOptions> {
    const keys = Object.keys(input);
    const values = Object.values(input);

    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    const columns = keys.join(', ');

    const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders}) RETURNING *;`;
    const [toolkitOption] = await this.database.query<ToolkitOptions>(
      query,
      values,
    );
    return toolkitOption;
  }

  async getScheduleWithReminders(
    scheduleId: string,
  ): Promise<UserScheduleData> {
    const query = `SELECT schedules.*,
    ROW_TO_JSON(user_toolkits.*)AS user_toolkit,
    ROW_TO_JSON(user_appointments.*) AS user_appointment,
    COALESCE(JSON_AGG(schedule_reminders.*) FILTER (WHERE schedule_reminders.id IS NOT NULL),'[]') AS schedule_reminders
    FROM schedules
    LEFT JOIN schedule_reminders ON schedule_reminders.schedule_id=schedules.id
    LEFT JOIN user_toolkits ON user_toolkits.id=schedules.user_toolkit_id
    LEFT JOIN user_appointments ON user_appointments.id=schedules.user_appointment_id
    WHERE schedules.id=$1
    GROUP BY schedules.id,user_toolkits.id,user_appointments.id`;
    const [schedule] = await this.database.query<UserScheduleData>(query, [
      scheduleId,
    ]);
    return schedule;
  }

  async getActiveTreatment(userId: string): Promise<Treatment> {
    const query = `SELECT * FROM treatments WHERE user_id = $1 AND is_deleted = $2;`;
    const [treatment] = await this.database.query<Treatment>(query, [
      userId,
      false,
    ]);
    return treatment;
  }
  private getUsersAppointmentJoin(lang: string): string {
    return ` LEFT JOIN LATERAL (
      SELECT
  user_appointments.*,
  ROW_TO_JSON(doctor.*) AS doctor,
  ROW_TO_JSON(users.*) AS users,
  COALESCE(
    (
      SELECT
        JSON_AGG(forms.*)
      FROM
        (
          SELECT
            forms.id,
            forms.hlp_reward_points,
            CASE
              WHEN forms.id = schedules.session_form_id
              THEN true
              ELSE false
              END AS is_session_form,
              CASE
              WHEN forms.id = schedules.complaint_form_id
              THEN true
              ELSE false
              END AS is_complaint_form,
            CASE
              WHEN forms.translations->> '${lang}' IS NOT NULL
              THEN (forms.translations->> '${lang}' )::json->>'title'
              ELSE forms.title
              END AS title,
            CASE
              WHEN user_form_answers.id IS NOT NULL THEN true
              ELSE false
            END AS is_completed
          FROM
            forms
            LEFT JOIN user_form_answers ON user_form_answers.form_id = forms.id
            AND user_form_answers.schedule_id = schedules.id  
            AND user_form_answers.user_appointment_id = schedules.user_appointment_id
            AND user_form_answers.session_date ::date > $2 ::date
            AND user_form_answers.session_date ::date < $3 ::date
          WHERE
            forms.id = schedules.session_form_id 
            OR forms.id = schedules.complaint_form_id 
          ORDER BY
            forms.created_at DESC ---fix sorting later
        ) AS forms
    ),
    '[]'
  ) AS appointment_forms
FROM
  user_appointments
  LEFT JOIN LATERAL (
    SELECT
      users.id,
      users.avatar_image_name,
      users.avatar,
      users.user_name,
      users.first_name,
      users.last_name,
      users.role
    FROM
      users
    WHERE
      user_appointments.user_id = users.id
  ) AS users ON true
  LEFT JOIN LATERAL (
    SELECT
      users.id,
      users.image_url,
      users.image_id,
      users.user_name,
      users.first_name,
      users.last_name,
      users.role,
      users.file_path
    FROM
      users
    WHERE
      user_appointments.doctor_id = users.id
  ) AS doctor ON true
WHERE
  user_appointments.id = schedules.user_appointment_id
    ) AS user_appointment ON true`;
  }
  async getSchedulesWithSessions(
    args: GetUserCalenderAgendaArgs,
    lang: string,
    filters?: AgendaFilter,
  ): Promise<SchedulesWithSessions[]> {
    const { userId, startDate, endDate } = args;
    const userAppointmentJoin = this.getUsersAppointmentJoin(lang);
    let commonQuery = ` FROM schedules
    ---user_appointments
    ${userAppointmentJoin}
    -- reminders
    LEFT JOIN (SELECT schedule_id,json_agg(schedule_reminders.*) AS reminders FROM schedule_reminders GROUP BY schedule_id) schedule_reminders ON schedule_reminders.schedule_id=schedules.id

    -- toolkits with unit
    LEFT JOIN (SELECT tool_kits.*,row_to_json(units.*) As unit FROM tool_kits JOIN units ON units.id=tool_kits.unit
    ) tool_kits ON tool_kits.id=schedules.tool_kit AND tool_kits.tool_kit_type!='HABIT'
    
    ---form_session_ids
    LEFT JOIN LATERAL(
      SELECT 
        json_agg(user_form_answers.session_id) AS form_session_ids
      FROM user_form_answers
      WHERE user_form_answers.schedule_id = schedules.id  AND user_form_answers.session_date ::date > $2 ::date
      AND user_form_answers.session_date ::date < $3 ::date
    ) AS user_form_answers ON true

WHERE
  schedules.user = $1
  AND schedules.schedule_type !='HABIT'
  AND (
    (
      schedules.is_schedule_disabled = false
    )
    OR (
      schedules.is_schedule_disabled = true
      AND schedules.end_date IS NOT NULL
      AND schedules.end_date ::date > $2 ::date
      AND schedules.end_date ::date < $3 ::date
    )
  )`;

    if (filters) {
      const filterConditions: string[] = [];

      if (filters.show_activity) {
        const placeHolders = ScheduleFor.USER_TOOLKIT;
        filterConditions.push(`schedules.schedule_for = '${placeHolders}'`);
      }

      if (filters.show_appointment) {
        const placeHolders = ScheduleFor.APPOINTMENT;
        filterConditions.push(`schedules.schedule_for = '${placeHolders}'`);
      }

      if (filterConditions.length) {
        commonQuery += ` AND (${filterConditions.join(' OR ')})`;
      }
    }
    const query = `SELECT schedules.*,schedules.repeat_per_day AS total_sessions,
    row_to_json(tool_kits.*) AS toolkit,
    row_to_json(user_appointment) As user_appointment,
    COALESCE(schedule_reminders.reminders,'[]') AS reminders,
    COALESCE(user_form_answers.form_session_ids, '[]') AS form_session_ids,
    COALESCE(
      (
        SELECT
          JSON_AGG(user_schedule_session.*)
        FROM
          (
            SELECT
              user_schedule_sessions.*
            FROM
              user_schedule_sessions
            WHERE
            user_schedule_sessions.schedule_id=schedules.id
            
          ) AS user_schedule_session
      ),
      '[]'
    ) AS sessions
    ${commonQuery}
  ORDER BY schedules.start_date DESC
`;
    const schedulesWithSessions =
      await this.database.query<SchedulesWithSessions>(query, [
        userId,
        startDate,
        endDate,
      ]);
    return schedulesWithSessions;
  }

  async getHabitSchedulesWithSessions(
    args: GetUserCalenderAgendaArgs,
  ): Promise<HabitSchedulesWithSessions[]> {
    const { userId } = args;
    const query = ` SELECT schedules.*,row_to_json(tool_kits.*) AS toolkit,
    tool_kits.habit_duration as total_sessions,
    COALESCE(
       (
         SELECT
           JSON_AGG(user_schedule_session.*)
         FROM
           (
             SELECT
               user_schedule_sessions.*
             FROM
               user_schedule_sessions
             WHERE
             user_schedule_sessions.schedule_id=schedules.id
             
           ) AS user_schedule_session
       ),
       '[]'
     ) AS sessions,
 
   COALESCE(
     (
         SELECT
             JSON_AGG(habit_day_with_tool)
         FROM
             (
                 SELECT
                     habit_days.*,
                     COALESCE( (
                         SELECT
                             JSON_AGG(habit_tool_with_toolkit)
                         FROM
                             (
                                 SELECT
                                     habit_tools.*,
                                     row_to_json(tool_kits.*) AS tool_kit,
                                     row_to_json(units.*) AS unit
                                 FROM
                                     habit_tools
                                     JOIN tool_kits ON habit_tools.habit_tool_kit_id = tool_kits.id
                                     JOIN units ON tool_kits.unit = units.id
                                 WHERE
                                     habit_days.id = habit_tools.day_id
                             ) AS habit_tool_with_toolkit
                       
                     ), '[]') AS habit_tools
                 FROM
                     habit_days
               WHERE habit_days.tool_kit_id = schedules.tool_kit
             ) AS habit_day_with_tool
     ),
     '[]'
 ) AS habit_days_with_tools,
 
     COALESCE(
       (
         SELECT
           JSON_AGG(habit_tools_deleted_from_agenda.*)
         FROM
           (
             SELECT
           habit_tools_deleted_from_agenda.*
           FROM
             habit_tools_deleted_from_agenda
             
             WHERE habit_tools_deleted_from_agenda.schedule_id = schedules.id
           ) AS habit_tools_deleted_from_agenda
       ),
       '[]'
     ) AS habit_tools_deleted_from_agenda,
   
     COALESCE(schedule_reminders.reminders,'[]') AS reminders
 
 
     FROM schedules
      JOIN tool_kits ON tool_kits.id = schedules.tool_kit AND tool_kits.tool_kit_type = 'HABIT' -- habit tools
 

   -- reminders
   LEFT JOIN (
     SELECT
       schedule_id,
       json_agg(schedule_reminders.*) AS reminders
     FROM
       schedule_reminders
     GROUP BY
       schedule_id
   ) schedule_reminders ON schedule_reminders.schedule_id = schedules.id
 
   WHERE schedules.user = $1 AND schedules.is_schedule_disabled = false
   ORDER BY schedules.start_date DESC
     `;
    const schedulesWithSessions =
      await this.database.query<HabitSchedulesWithSessions>(query, [userId]);
    return schedulesWithSessions;
  }

  async saveUserAppointment(
    input: SaveUserAppointmentInput,
  ): Promise<UserAppointment> {
    const keys = Object.keys(input);
    const values = Object.values(input);
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    const columns = keys.join(', ');

    const query = `INSERT INTO user_appointments (${columns}) VALUES (${placeholders}) RETURNING *;`;
    const [userAppointment] = await this.database.query<UserAppointment>(
      query,
      values,
    );
    return userAppointment;
  }

  async getUserAppointmentByScheduleId(
    schduleId: string,
    userId: string,
  ): Promise<UserAppointment> {
    const query = `SELECT user_appointments.* FROM schedules
    LEFT JOIN user_appointments ON schedules.user_appointment_id = user_appointments.id
    WHERE schedules.id = $1 AND schedules.user_appointment_id IS NOT NULL AND schedules.user =$2;;`;
    const [user_appointment] = await this.database.query<UserAppointment>(
      query,
      [schduleId, userId],
    );
    return user_appointment;
  }

  async disableScheduleTreatmentTimeline(
    scheduleIds: string[],
  ): Promise<TreatmentTimeline[]> {
    const query = `UPDATE treatment_timeline SET is_deleted = $1 WHERE schedule_id = ANY($2::uuid[]) RETURNING *`;
    const disabledTreatmentTimeline =
      await this.database.query<TreatmentTimeline>(query, [true, scheduleIds]);
    return disabledTreatmentTimeline;
  }

  async disableAppointmentSchedule(
    appointmentId: string,
    date: string,
    userId: string,
  ): Promise<ScheduleEntity[]> {
    const query = `UPDATE schedules 
    SET is_schedule_disabled = $1, end_date = $2, updated_by = $3 
    WHERE schedules.user_appointment_id=$4 RETURNING *`;
    const disabledAppointmentSchedule =
      await this.database.query<ScheduleEntity>(query, [
        true,
        date,
        userId,
        appointmentId,
      ]);
    return disabledAppointmentSchedule;
  }

  async getUserScheduleById<T>(scheduleId: string, userId: string): Promise<T> {
    const query = `SELECT * FROM schedules 
    WHERE schedules.id=$1 AND schedules.user=$2`;
    const [schedule] = await this.database.query<T>(query, [
      scheduleId,
      userId,
    ]);
    return schedule;
  }

  async getUserToolkitOrAppointmentsById<T>(
    id: string,
    schedule_for: ScheduleFor,
  ): Promise<T> {
    const tableName =
      schedule_for === ScheduleFor.USER_TOOLKIT
        ? 'user_toolkits'
        : 'user_appointments';

    const query = `SELECT * FROM ${tableName} WHERE id=$1;`;
    const [data] = await this.database.query<T>(query, [id]);
    return data;
  }

  async updateUserToolkitById(
    id: string,
    updates: UpdateUserToolkitInput,
  ): Promise<UserTookit> {
    const keys = Object.keys(updates);
    const values = Object.values(updates);
    const params = [...values, id];

    const setFields = keys
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');

    const query = `UPDATE user_toolkits SET ${setFields} WHERE id = $${
      keys.length + 1
    } RETURNING *;`;

    const [userToolkit] = await this.database.query<UserTookit>(query, params);
    return userToolkit;
  }

  async updateUserAppointmentById(
    id: string,
    updates: UpdateUserAppointmentInput,
  ): Promise<UserAppointment> {
    const keys = Object.keys(updates);
    const values = Object.values(updates);
    const params = [...values, id];

    const setFields = keys
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');

    const query = `UPDATE user_appointments SET ${setFields} WHERE id = $${
      keys.length + 1
    } RETURNING *;`;

    const [userAppointment] = await this.database.query<UserAppointment>(
      query,
      params,
    );
    return userAppointment;
  }

  async updateScheduleById(
    id: string,
    updates: UpdateSchedulesInput,
  ): Promise<ScheduleEntity> {
    const keys = Object.keys(updates);
    const values = Object.values(updates);

    const fields = keys
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');

    const query = `UPDATE schedules SET ${fields} WHERE id = $${
      keys.length + 1
    } RETURNING *;`;

    const params = [...values, id];

    const [schedule] = await this.database.query<ScheduleEntity>(query, params);
    return schedule;
  }

  async updateScheduleByUserAppointmentId(
    userAppointmentId: string,
    updates: UpdateSchedulesInput,
  ): Promise<ScheduleEntity[]> {
    const keys = Object.keys(updates);
    const values = Object.values(updates);

    const fields = keys
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');

    const query = `UPDATE schedules SET ${fields} WHERE user_appointment_id = $${
      keys.length + 1
    } RETURNING *;`;

    const params = [...values, userAppointmentId];
    const updatedSchedules = await this.database.query<ScheduleEntity>(
      query,
      params,
    );
    return updatedSchedules;
  }

  async getUnreadChatCount(userId: string): Promise<number> {
    const query = `
      SELECT COALESCE(COUNT(*), 0) AS unread_chat_count
      FROM (
        SELECT chat_messages.chat_id
        FROM chat_messages
        WHERE is_deleted = $2
        AND sender_id <>$1
          AND is_read = $2
        GROUP BY chat_messages.chat_id
      ) AS chat_messages
      JOIN chat_users ON chat_messages.chat_id = chat_users.chat_id
      WHERE chat_users.user_id = $1
        AND chat_users.is_archived = $2
        AND chat_users.is_deleted = $2;
    `;
    const [result] = await this.database.query<{ unread_chat_count: number }>(
      query,
      [userId, false],
    );
    return result.unread_chat_count;
  }

  async updateSelectedToolkitOption(
    update: UpdateToolkitOptionsInput,
    tableName: string,
    scheduleId: string,
    userId: string,
  ): Promise<ToolkitOptions> {
    const keys = Object.keys(update);
    const values = Object.values(update);

    const setFields = keys
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');

    const query = `UPDATE ${tableName} SET ${setFields} WHERE schedule_id = $${
      keys.length + 1
    } AND user_id = $${keys.length + 2} RETURNING *;`;

    const updateValues = [...values, scheduleId, userId];
    const [toolkitOption] = await this.database.query<ToolkitOptions>(
      query,
      updateValues,
    );

    return toolkitOption;
  }

  async getUserToolkitByScheduleId(
    schduleId: string,
    userId: string,
  ): Promise<UserTookit> {
    const query = `SELECT user_toolkits.* FROM schedules
    LEFT JOIN user_toolkits ON schedules.user_toolkit_id = user_toolkits.id
    WHERE schedules.id = $1 AND schedules.user_toolkit_id IS NOT NULL AND schedules.user =$2;`;
    const [userToolkit] = await this.database.query<UserTookit>(query, [
      schduleId,
      userId,
    ]);
    return userToolkit;
  }
}
