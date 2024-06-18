import { Injectable } from '@nestjs/common';
import { Database } from '../core/modules/database/database.service';
import { Schedule } from '../schedules/schedules.model';
import {
  Checkin,
  CheckinLevelWithStatus,
  ScheduleWithSessionsAndAnswer,
  UserCheckinLevel,
} from './checkins.dto';
import {
  CheckinWithToolkitType,
  GetCheckInsListWithUserCheckInStatusRes,
} from './dto/checkins-history.dto';
import { CheckInInfo } from './entities/check-in-info.entity';
import { ScheduleAndCheckinWithAnswers } from './dto/checkin-logs.dto';
import { DateTime } from 'luxon';
import {
  toolkitAnswerTables,
  BloodPressureToolkitAnswers,
  HeartRateToolkitAnswers,
  SleepCheckToolkitAnswers,
  StepsToolkitAnswers,
  ToolkitType,
  WeightIntakeToolkitAnswers,
} from '../toolkits/toolkits.model';

@Injectable()
export class CheckinsRepo {
  constructor(private readonly database: Database) {}

  async getCheckinLevels(userId: string): Promise<CheckinLevelWithStatus[]> {
    const query = `
     SELECT check_in_levels.*,
     CASE
     WHEN check_in_levels.id = user_check_in_levels.check_in_level_id THEN true ELSE false END AS is_completed
     FROM check_in_levels
     LEFT JOIN user_check_in_levels ON check_in_levels.id = user_check_in_levels.check_in_level_id AND user_check_in_levels.user_id = $1
     ORDER BY check_in_levels.sequence_number
     `;
    const checkInLevels = await this.database.query<CheckinLevelWithStatus>(
      query,
      [userId],
    );
    return checkInLevels;
  }
  async getCheckinsTotalPoints(userId: string): Promise<number> {
    const query = `SELECT  COALESCE(SUM(tool_kits.tool_kit_hlp_reward_points),0) AS total FROM user_schedule_sessions
    RIGHT JOIN tool_kits ON tool_kits.id=user_schedule_sessions.tool_kit_id
    WHERE checkin_id IS NOT NULL AND user_schedule_sessions.user_id=$1`;
    const [aggregate] = await this.database.query<{ total: number }>(query, [
      userId,
    ]);
    return aggregate.total;
  }

  async saveUserCheckinLevel(
    userId: string,
    LevelId: string,
  ): Promise<UserCheckinLevel> {
    const query = `INSERT INTO user_check_in_levels(user_id,check_in_level_id) VALUES ($1,$2) RETURNING *`;
    const [userCheckinLevel] = await this.database.query<UserCheckinLevel>(
      query,
      [userId, LevelId],
    );
    return userCheckinLevel;
  }

  async getUserCheckins(): Promise<Checkin[]> {
    const query = `SELECT check_ins.*,row_to_json(tool_kits.*) AS tool_kit FROM check_ins
    LEFT JOIN tool_kits ON tool_kits.id=check_ins.tool_kit_id
    ORDER BY check_ins.created_at DESC`;
    const checkins = await this.database.query<Checkin>(query, []);
    return checkins;
  }

  getCheckinRecentAnswersQuery(): string {
    const query = `CASE ${Array.from(
      toolkitAnswerTables,
      ([, value]) => value,
    ).map(
      (table) =>
        `WHEN checkin_schedules.id=${table}.schedule_id THEN row_to_json(${table}.*)`,
    )}
    END AS latest_answer`;
    return query;
  }

  getCheckinRecentAnswersJoinsQuery(): string {
    const query = `${Array.from(toolkitAnswerTables, ([, value]) => value).map(
      (table) =>
        `LEFT JOIN (SELECT  * FROM ${table} ORDER BY created_at DESC LIMIT 1 ) ${table}  ON checkin_schedules.id=${table}.schedule_id`,
    )}
    `;
    return query;
  }

  getActiveSchedulesByCheckinIdsQuery(): string {
    const query = `SELECT schedules.*,tool_kits.tool_kit_type,tool_kits.tool_kit_category,tool_kits.goal_id,units.unit AS toolkit_unit FROM schedules
    LEFT JOIN tool_kits ON tool_kits.id=schedules.tool_kit
    LEFT JOIN units ON units.id=tool_kits.unit
    WHERE
    schedules.start_date <=$1::date AND schedules.user=$2 AND is_schedule_disabled=false`;
    return query;
  }

  async getSchedulesByCheckinIds(
    checkinIds: string[],
    userId: string,
    scheduleStartDate: string,
    sessionStartDate: string,
    sessionEndDate: string,
    dayOfMonth: number,
    weekDay: string,
  ): Promise<ScheduleWithSessionsAndAnswer[]> {
    const checkinRecentAnswersQuery = this.getCheckinRecentAnswersQuery()
      .split(',')
      .join(' ');
    const activeSchedulesQuery = this.getActiveSchedulesByCheckinIdsQuery();
    const checkinRecentAnswersJoinsQuery =
      this.getCheckinRecentAnswersJoinsQuery().split(',').join(' ');

    const query = `SELECT checkin_schedules.*,COALESCE(sessions,'[]') AS sessions,
    ${checkinRecentAnswersQuery} FROM (${activeSchedulesQuery}) AS checkin_schedules
    LEFT JOIN (SELECT schedule_id,MIN(session_date), json_agg(user_schedule_sessions.*) as sessions FROM user_schedule_sessions WHERE session_date BETWEEN $3::date AND $4::date GROUP BY schedule_id)user_schedule_sessions ON user_schedule_sessions.schedule_id=checkin_schedules.id
    ${checkinRecentAnswersJoinsQuery}
    WHERE $6= ANY(schedule_days)
    OR $5=ANY(repeat_per_month)
    OR schedule_type='DAILY'
    OR schedule_type='ONETIME'
    ORDER BY checkin_schedules.created_at DESC
    `;
    const params = [
      scheduleStartDate,
      userId,
      sessionStartDate,
      sessionEndDate,
      dayOfMonth,
      weekDay,
    ];
    const data = await this.database.query<ScheduleWithSessionsAndAnswer>(
      query,
      params,
    );
    return data;
  }

  async disableCheckinSchedules(
    checkinId: string,
    userId: string,
  ): Promise<Schedule[]> {
    const query = `UPDATE schedules SET is_schedule_disabled=true WHERE schedules.check_in=$1 AND schedules.user=$2 RETURNING *`;
    const result = await this.database.query<Schedule>(query, [
      checkinId,
      userId,
    ]);
    return result;
  }

  async getCheckin(id: string): Promise<Checkin> {
    const query = `SELECT check_ins.*,row_to_json(tool_kits.*) AS tool_kit FROM check_ins
    LEFT JOIN tool_kits ON tool_kits.id=check_ins.tool_kit_id
    WHERE check_ins.id=$1`;
    const [checkin] = await this.database.query<Checkin>(query, [id]);
    return checkin;
  }

  async getCheckinsHistory(userId: string): Promise<CheckinWithToolkitType[]> {
    const query = `SELECT session_date,check_ins.*,tool_kits.tool_kit_type FROM (
        SELECT DISTINCT ON (user_schedule_sessions.checkin_id) user_schedule_sessions.session_date, user_schedule_sessions.checkin_id AS id FROM user_schedule_sessions
        WHERE user_schedule_sessions.user_id=$1 AND user_schedule_sessions.checkin_id IS NOT NULL
      ) checkins
      JOIN check_ins ON check_ins.id=checkins.id
      JOIN tool_kits ON tool_kits.id=check_ins.tool_kit_id
      ORDER BY session_date DESC`;
    const checkins = await this.database.query<CheckinWithToolkitType>(query, [
      userId,
    ]);
    return checkins;
  }

  getCheckInAnswersQuery(toolkiType: ToolkitType): string {
    const tableName = toolkitAnswerTables.get(toolkiType) as string;
    return `SELECT * FROM ${tableName}
    LEFT JOIN schedules ON ${tableName}.schedule_id = schedules.id
    WHERE ${tableName}.user_id=$1
    AND ${tableName}.session_date = $2
    AND schedules.check_in IS NOT NULL;`;
  }

  async getCheckInSleepToolAnswers(
    userId: string,
    date: string,
  ): Promise<SleepCheckToolkitAnswers[]> {
    const query = this.getCheckInAnswersQuery(ToolkitType.SLEEP_CHECK);
    const params = [userId, date];
    const sleepToolAnswers =
      await this.database.query<SleepCheckToolkitAnswers>(query, params);
    return sleepToolAnswers;
  }

  async getCheckInHeartRateToolAnswers(
    userId: string,
    date: string,
  ): Promise<HeartRateToolkitAnswers[]> {
    const query = this.getCheckInAnswersQuery(ToolkitType.HEART_RATE);
    const params = [userId, date];
    const heartRateToolAnswers =
      await this.database.query<HeartRateToolkitAnswers>(query, params);
    return heartRateToolAnswers;
  }

  async getCheckInBloodPressureToolAnswers(
    userId: string,
    date: string,
  ): Promise<BloodPressureToolkitAnswers[]> {
    const query = this.getCheckInAnswersQuery(ToolkitType.BLOOD_PRESSURE);
    const params = [userId, date];
    const bloodPressureToolAnswers =
      await this.database.query<BloodPressureToolkitAnswers>(query, params);
    return bloodPressureToolAnswers;
  }

  async getCheckInStepsToolAnswers(
    userId: string,
    date: string,
  ): Promise<StepsToolkitAnswers[]> {
    const query = this.getCheckInAnswersQuery(ToolkitType.STEPS);
    const params = [userId, date];
    const stepsToolAnswers = await this.database.query<StepsToolkitAnswers>(
      query,
      params,
    );
    return stepsToolAnswers;
  }

  async getCheckInWeightToolAnswers(
    userId: string,
    date: string,
  ): Promise<WeightIntakeToolkitAnswers[]> {
    const query = this.getCheckInAnswersQuery(ToolkitType.WEIGHT);
    const params = [userId, date];
    const weightToolAnswers =
      await this.database.query<WeightIntakeToolkitAnswers>(query, params);
    return weightToolAnswers;
  }

  async getMoodCheckLogs(
    userId: string,
    date: string,
  ): Promise<{ time: string; emoji: number }[]> {
    const query = `SELECT user_mood_checks.created_at::time as time, mood_check_categories.ranking as emoji
    FROM user_mood_checks
    LEFT JOIN mood_check_categories ON mood_check_categories.id = user_mood_checks.category_id
    WHERE user_mood_checks.user_id = $1 AND mood_check_categories.ranking <= 5
    AND user_mood_checks.date = $2`;
    const params = [userId, date];
    const moodChecks = await this.database.query<{
      time: string;
      emoji: number;
    }>(query, params);
    return moodChecks;
  }

  async getCheckInInfo(): Promise<CheckInInfo> {
    const checkinInfoQuery = `SELECT * FROM check_in_info`;
    const [checkInfo] = await this.database.query<CheckInInfo>(
      checkinInfoQuery,
      [],
    );
    return checkInfo;
  }

  async getCheckinWithScheduleAndAnswers(
    userId: string,
    date: string,
  ): Promise<ScheduleAndCheckinWithAnswers[]> {
    const query = `
    SELECT checkin_schedules.*,
    CASE
      WHEN checkin_schedules.id = medication_tool_kit_answers.schedule_id THEN row_to_json(medication_tool_kit_answers.*)
      WHEN checkin_schedules.id = sleep_check_tool_kit_answers.schedule_id THEN row_to_json(sleep_check_tool_kit_answers.*)
      WHEN checkin_schedules.id = heart_rate_tool_kit_answers.schedule_id THEN row_to_json(heart_rate_tool_kit_answers.*)
      WHEN checkin_schedules.id = blood_pressure_tool_kit_answers.schedule_id THEN row_to_json(blood_pressure_tool_kit_answers.*)
      WHEN checkin_schedules.id = steps_tool_kit_answers.schedule_id THEN row_to_json(steps_tool_kit_answers.*)
      WHEN checkin_schedules.id = weight_intake_tool_kit_answers.schedule_id THEN row_to_json(weight_intake_tool_kit_answers.*)
    END AS toolkit_answers
  FROM
    (
      SELECT
        schedules.*,
        tool_kits.tool_kit_type,
        tool_kits.tool_kit_category,
        tool_kits.goal_id,
        check_ins.title as check_ins_title,
        check_ins.avatar as check_ins_avatar,
        check_ins.emoji_image_url,
        check_ins.emoji_image_id,
        check_ins.emoji_image_file_path,
        units.unit AS toolkit_unit
      FROM
        schedules
        LEFT JOIN tool_kits ON tool_kits.id = schedules.tool_kit
        LEFT JOIN units ON units.id = tool_kits.unit
        LEFT JOIN check_ins ON check_ins.tool_kit_id = schedules.tool_kit
      WHERE
        tool_kits.tool_kit_type = ANY('{MEDICATION,SLEEP_CHECK,BLOOD_PRESSURE,HEART_RATE,STEPS,WEIGHT}':: text [])
        AND schedules.start_date <= $2 ::date
        AND schedules.user = $1
     AND schedules.schedule_for = 'CHECK_IN'
        AND is_schedule_disabled = false
    ) AS checkin_schedules

    LEFT OUTER JOIN (
      SELECT
        schedule_id,
        json_agg(medication_tool_kit_answers.*) as answers
      FROM
      medication_tool_kit_answers
      WHERE medication_tool_kit_answers.session_date = $2
      GROUP BY
        schedule_id
    ) medication_tool_kit_answers ON checkin_schedules.id = medication_tool_kit_answers.schedule_id

    LEFT OUTER JOIN (
      SELECT
        schedule_id,
        json_agg(sleep_check_tool_kit_answers.*) as answers
      FROM
        sleep_check_tool_kit_answers
      WHERE sleep_check_tool_kit_answers.session_date = $2
      GROUP BY
        schedule_id
    ) sleep_check_tool_kit_answers ON checkin_schedules.id = sleep_check_tool_kit_answers.schedule_id

    LEFT OUTER JOIN (
      SELECT
        schedule_id,
        json_agg(heart_rate_tool_kit_answers.*) as answers
      FROM
        heart_rate_tool_kit_answers
      WHERE heart_rate_tool_kit_answers.session_date = $2
      GROUP BY
        schedule_id
    ) heart_rate_tool_kit_answers ON checkin_schedules.id = heart_rate_tool_kit_answers.schedule_id

    LEFT OUTER JOIN (
      SELECT
        schedule_id,
        json_agg(blood_pressure_tool_kit_answers.*) as answers
      FROM
        blood_pressure_tool_kit_answers
      WHERE blood_pressure_tool_kit_answers.session_date = $2
      GROUP BY
        schedule_id
    ) blood_pressure_tool_kit_answers ON checkin_schedules.id = blood_pressure_tool_kit_answers.schedule_id

    LEFT OUTER JOIN (
      SELECT
        schedule_id,
        json_agg(steps_tool_kit_answers.*) as answers
      FROM
        steps_tool_kit_answers
      WHERE steps_tool_kit_answers.session_date = $2
      GROUP BY
        schedule_id
    ) steps_tool_kit_answers ON checkin_schedules.id = steps_tool_kit_answers.schedule_id

    LEFT OUTER JOIN (
      SELECT
        schedule_id,
        json_agg(weight_intake_tool_kit_answers.*) as answers
      FROM
        weight_intake_tool_kit_answers
      WHERE weight_intake_tool_kit_answers.session_date = $2
      GROUP BY
        schedule_id
    ) weight_intake_tool_kit_answers ON checkin_schedules.id = weight_intake_tool_kit_answers.schedule_id

  WHERE
    $3 = ANY(schedule_days)
    OR $4 = ANY(repeat_per_month)
    OR schedule_type = 'DAILY'
    OR (schedule_type = 'ONETIME' AND start_date =  $2 )
  ORDER BY
    checkin_schedules.created_at DESC`;
    const inputDate = DateTime.fromISO(date);
    const dayOfWeek = inputDate.weekdayShort;
    const day = inputDate.get('day');
    const params = [userId, date, dayOfWeek, day];
    const data = await this.database.query<ScheduleAndCheckinWithAnswers>(
      query,
      params,
    );
    return data;
  }

  async getCheckInsListWithUserCheckInStatus(
    userId: string,
  ): Promise<GetCheckInsListWithUserCheckInStatusRes[]> {
    const query = `
    SELECT check_ins.*,
    ROW_TO_JSON(tool_kits.*) AS tool_kit,
    COALESCE(JSON_AGG(user_check_ins.*) FILTER (WHERE user_check_ins.id IS NOT NULL),'[]') AS user_check_ins
    FROM check_ins
    JOIN tool_kits ON tool_kits.id=check_ins.tool_kit_id
    LEFT JOIN user_check_ins ON user_check_ins.check_in=check_ins.id AND user_check_ins.user_id=$1
    GROUP BY check_ins.id, tool_kits.id
    `;
    const checkIn =
      await this.database.query<GetCheckInsListWithUserCheckInStatusRes>(
        query,
        [userId],
      );
    return checkIn;
  }
}
