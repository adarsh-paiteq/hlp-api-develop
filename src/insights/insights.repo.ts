import { Database } from '@core/modules/database/database.service';
import { Injectable, Logger } from '@nestjs/common';
import { Users } from '../users/users.model';
import { Toolkit } from '../toolkits/toolkits.model';
import { FeelingType } from '../user-mood-checks/entities/user-mood-check.entity';
import {
  ActivityVsMoodGraph,
  StepsVsMoodGraph,
} from './dto/activity-insights.dto';
import { InsightRange } from './dto/insights.dto';
import {
  DailyMoodBarGraph,
  Feelings,
  FeelingsCount,
  getMoodChartDateField,
  MoodChartData,
} from './dto/mood-insights.dto';
import { SleepHourVsMoodGraph, SleepTimeField } from './dto/sleep-insights.dto';

@Injectable()
export class InsightsRepo {
  private readonly logger = new Logger(InsightsRepo.name);
  constructor(private readonly database: Database) {}

  async getUserMoodEntries(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<{ mood_entries: number }> {
    const query = `SELECT COUNT(user_mood_checks.*) AS mood_entries FROM user_mood_checks WHERE user_mood_checks.user_id = $1
    AND user_mood_checks.date BETWEEN $2 AND $3`;
    const params = [userId, startDate, endDate];
    const [result] = await this.database.query<{ mood_entries: number }>(
      query,
      params,
    );
    return result;
  }

  async getMoodCheckLongestStreak(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<{ longest_streak: number }> {
    const query = `SELECT COALESCE(MAX(streak_count),0) AS longest_streak FROM user_mood_check_streaks
    WHERE user_mood_check_streaks.user_id=$1 AND user_mood_check_streaks.date BETWEEN $2 AND $3`;
    const [streak] = await this.database.query<{ longest_streak: number }>(
      query,
      [userId, startDate, endDate],
    );
    return streak;
  }

  async getMoodInsightsChart(
    userId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<MoodChartData[]> {
    let queryCondition = ' ';
    const params = [userId];
    if (startDate && endDate) {
      queryCondition = 'AND user_mood_checks.date BETWEEN $2 AND $3';
      params.push(startDate, endDate);
    }
    const query = `SELECT user_mood_checks.date AS label, MODE() WITHIN GROUP (ORDER BY mood_check_categories.ranking) AS value
    FROM user_mood_checks
    LEFT JOIN mood_check_categories ON mood_check_categories.id = user_mood_checks.category_id
    WHERE user_mood_checks.user_id = $1 AND mood_check_categories.ranking <= 5
    ${queryCondition}
    GROUP BY user_mood_checks.date
    ORDER BY user_mood_checks.date ASC;`;
    const moodChart = await this.database.query<MoodChartData>(query, params);
    return moodChart;
  }

  async getAverageSteps(
    userId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<{ avg_steps: number }> {
    let queryCondition = ' ';
    const params = [userId];
    if (startDate && endDate) {
      queryCondition =
        'AND steps_tool_kit_answers.session_date BETWEEN $2 AND $3';
      params.push(startDate, endDate);
    }
    const query = `SELECT
    COALESCE(ROUND(AVG(steps_tool_kit_answers.steps)), 0) as avg_steps
    FROM steps_tool_kit_answers
    WHERE steps_tool_kit_answers.user_id = $1 ${queryCondition};`;
    const [steps] = await this.database.query<{ avg_steps: number }>(
      query,
      params,
    );
    return steps;
  }

  async getAverageActivityTime(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<{ avg_activity: number }> {
    const params = [userId, startDate, endDate];
    const query = `SELECT COALESCE(ROUND(AVG(activity_tool_kit_answers.consumed_duration)), 0) as avg_activity
    FROM activity_tool_kit_answers
    WHERE activity_tool_kit_answers.user_id = $1
    AND activity_tool_kit_answers.session_date BETWEEN $2 AND $3;`;
    const [activity] = await this.database.query<{ avg_activity: number }>(
      query,
      params,
    );
    return activity;
  }

  async getAverageSleep(
    userId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<{ avg_sleep_time: number }> {
    let queryCondition = ' ';
    const params = [userId];
    if (startDate && endDate) {
      queryCondition =
        'AND sleep_check_tool_kit_answers.session_date BETWEEN $2 AND $3';
      params.push(startDate, endDate);
    }
    const query = `SELECT
    COALESCE(ROUND(AVG(sleep_check_tool_kit_answers.total_sleep_time)), 0) as avg_sleep_time
    FROM sleep_check_tool_kit_answers
    WHERE sleep_check_tool_kit_answers.user_id = $1 ${queryCondition};`;
    const [sleep] = await this.database.query<{ avg_sleep_time: number }>(
      query,
      params,
    );
    return sleep;
  }

  async getPositiveAndNegativeFeelings(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<Feelings> {
    const query = `SELECT COALESCE(json_agg(DISTINCT mood_check_sub_categories.title)
    FILTER ( WHERE user_mood_checks.feeling_type = '${FeelingType.POSITIVE}' ),'[]'::json) AS positive_feelings,
    COALESCE(json_agg(DISTINCT mood_check_sub_categories.title)
    FILTER ( WHERE user_mood_checks.feeling_type = '${FeelingType.NEGATIVE}' ),'[]'::json) AS negative_feelings
    FROM mood_check_sub_categories
    LEFT JOIN user_mood_checks ON mood_check_sub_categories.category_id = user_mood_checks.category_id
    WHERE user_mood_checks.user_id = $1
    AND user_mood_checks.feeling_type != '${FeelingType.NEUTRAL}'
    AND mood_check_sub_categories.id :: TEXT = ANY(user_mood_checks.sub_category_ids)
    AND user_mood_checks.date BETWEEN $2 AND $3; `;
    const params = [userId, startDate, endDate];
    const [result] = await this.database.query<{
      positive_feelings: string[];
      negative_feelings: string[];
    }>(query, params);
    return {
      positiveFeelings: result.positive_feelings,
      negativeFeelings: result.negative_feelings,
    };
  }

  async getMedicationMoodLogs(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<FeelingsCount[]> {
    const query = `
    SELECT
    CASE
      WHEN medication_tool_kit_answers.feeling = 0 THEN (
        SELECT
          COUNT(medication_tool_kit_answers.feeling)
        FROM
          medication_tool_kit_answers
        WHERE
          medication_tool_kit_answers.user_id = $1
          AND medication_tool_kit_answers.feeling = 0
          AND medication_tool_kit_answers.session_date BETWEEN $2
          AND $3
      )
      ELSE 0
    END AS awful,
    CASE
      WHEN medication_tool_kit_answers.feeling = 1 THEN (
        SELECT
          COUNT(medication_tool_kit_answers.feeling)
        FROM
          medication_tool_kit_answers
        WHERE
          medication_tool_kit_answers.user_id = $1
          AND medication_tool_kit_answers.feeling = 1
          AND medication_tool_kit_answers.session_date BETWEEN $2
          AND $3
      )
      ELSE 0
    END AS bad,
    CASE
      WHEN medication_tool_kit_answers.feeling = 2 THEN (
        SELECT
          COUNT(medication_tool_kit_answers.feeling)
        FROM
          medication_tool_kit_answers
        WHERE
          medication_tool_kit_answers.user_id = $1
          AND medication_tool_kit_answers.feeling = 2
          AND medication_tool_kit_answers.session_date BETWEEN $2
          AND $3
      )
      ELSE 0
    END AS mwahh,
    CASE
      WHEN medication_tool_kit_answers.feeling = 3 THEN (
        SELECT
          COUNT(medication_tool_kit_answers.feeling)
        FROM
          medication_tool_kit_answers
        WHERE
          medication_tool_kit_answers.user_id = $1
          AND medication_tool_kit_answers.feeling = 3
          AND medication_tool_kit_answers.session_date BETWEEN $2
          AND $3
      )
      ELSE 0
    END AS good,
    CASE
      WHEN medication_tool_kit_answers.feeling = 4 THEN (
        SELECT
          COUNT(medication_tool_kit_answers.feeling)
        FROM
          medication_tool_kit_answers
        WHERE
          medication_tool_kit_answers.user_id = $1
          AND medication_tool_kit_answers.feeling = 4
          AND medication_tool_kit_answers.session_date BETWEEN $2
          AND $3
      )
      ELSE 0
    END AS amazing
  FROM
    medication_tool_kit_answers
  WHERE
    medication_tool_kit_answers.user_id = $1
    AND medication_tool_kit_answers.feeling IS NOT NULL
    AND medication_tool_kit_answers.session_date BETWEEN $2
    AND $3
  GROUP BY
    medication_tool_kit_answers.feeling`;
    const params = [userId, startDate, endDate];
    const feelingsCount = await this.database.query<FeelingsCount>(
      query,
      params,
    );
    return feelingsCount;
  }

  async getEffectiveToolkits(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<
    {
      toolkits: Toolkit;
    }[]
  > {
    const query = `SELECT
    to_json(tool_kits.*) AS toolkits,
    CASE
      WHEN tool_kits.tool_kit_type = 'SLEEP_CHECK' THEN (
        SELECT
          COUNT(sleep_check_tool_kit_answers.id)
        FROM
          sleep_check_tool_kit_answers
        WHERE
          sleep_check_tool_kit_answers.user_id = $1
          AND sleep_check_tool_kit_answers.quality_of_sleep >= 3
          AND sleep_check_tool_kit_answers.session_date BETWEEN $2
          AND $3
      )
      WHEN tool_kits.tool_kit_type = 'WEIGHT' THEN (
        SELECT
          COUNT(weight_intake_tool_kit_answers.id)
        FROM
          weight_intake_tool_kit_answers
        WHERE
          weight_intake_tool_kit_answers.user_id = $1
          AND weight_intake_tool_kit_answers.feeling >= 3
          AND weight_intake_tool_kit_answers.session_date BETWEEN $2
          AND $3
      )
      WHEN tool_kits.tool_kit_type = 'ALCOHOL_INTAKE' THEN (
        SELECT
          COUNT(alcohol_intake_tool_kit_answers.id)
        FROM
          alcohol_intake_tool_kit_answers
        WHERE
          alcohol_intake_tool_kit_answers.user_id = $1
          AND alcohol_intake_tool_kit_answers.feeling >= 3
          AND alcohol_intake_tool_kit_answers.session_date BETWEEN $2
          AND $3
      )
      WHEN tool_kits.tool_kit_type = 'ECG' THEN (
        SELECT
          COUNT(ecg_tool_kit_answers.id)
        FROM
          ecg_tool_kit_answers
        WHERE
          ecg_tool_kit_answers.user_id = $1
          AND ecg_tool_kit_answers.feeling >= 3
          AND ecg_tool_kit_answers.session_date BETWEEN $2
          AND $3
      )
      WHEN tool_kits.tool_kit_type = 'MEDICATION' THEN (
        SELECT
          COUNT(medication_tool_kit_answers.id)
        FROM
          medication_tool_kit_answers
        WHERE
          medication_tool_kit_answers.user_id = $1
          AND medication_tool_kit_answers.feeling >= 3
          AND medication_tool_kit_answers.session_date BETWEEN $2
          AND $3
      )
      WHEN tool_kits.tool_kit_type = 'STEPS' THEN (
        SELECT
          COUNT(steps_tool_kit_answers.id)
        FROM
          steps_tool_kit_answers
        WHERE
          steps_tool_kit_answers.user_id = $1
          AND steps_tool_kit_answers.feeling >= 3
          AND steps_tool_kit_answers.session_date BETWEEN $2
          AND $3
      )
      WHEN tool_kits.tool_kit_type = 'MEDITATION' THEN (
        SELECT
          COUNT(meditation_tool_kit_answers.id)
        FROM
          meditation_tool_kit_answers
        WHERE
          meditation_tool_kit_answers.user_id = $1
          AND meditation_tool_kit_answers.feeling >= 3
          AND meditation_tool_kit_answers.session_date BETWEEN $2
          AND $3
      )
      WHEN tool_kits.tool_kit_type = 'ACTIVITY' THEN (
        SELECT
          COUNT(activity_tool_kit_answers.id)
        FROM
          activity_tool_kit_answers
        WHERE
          activity_tool_kit_answers.user_id = $1
          AND activity_tool_kit_answers.feeling >= 3
          AND activity_tool_kit_answers.session_date BETWEEN $2
          AND $3
      )
      WHEN tool_kits.tool_kit_type = 'PODCAST' THEN (
        SELECT
          COUNT(podcast_tool_kit_answers.id)
        FROM
          podcast_tool_kit_answers
        WHERE
          podcast_tool_kit_answers.user_id = $1
          AND podcast_tool_kit_answers.feeling >= 3
          AND podcast_tool_kit_answers.session_date BETWEEN $2
          AND $3
      )
      WHEN tool_kits.tool_kit_type = 'BLOOD_PRESSURE' THEN (
        SELECT
          COUNT(blood_pressure_tool_kit_answers.id)
        FROM
          blood_pressure_tool_kit_answers
        WHERE
          blood_pressure_tool_kit_answers.user_id = $1
          AND blood_pressure_tool_kit_answers.feeling >= 3
          AND blood_pressure_tool_kit_answers.session_date BETWEEN $2
          AND $3
      )
      WHEN tool_kits.tool_kit_type = 'HEART_RATE' THEN (
        SELECT
          COUNT(heart_rate_tool_kit_answers.id)
        FROM
          heart_rate_tool_kit_answers
        WHERE
          heart_rate_tool_kit_answers.user_id = $1
          AND heart_rate_tool_kit_answers.feeling >= 3
          AND heart_rate_tool_kit_answers.session_date BETWEEN $2
          AND $3
      )
      WHEN tool_kits.tool_kit_type = 'SPORT' THEN (
        SELECT
          COUNT(sports_tool_kit_answers.id)
        FROM
          sports_tool_kit_answers
        WHERE
          sports_tool_kit_answers.user_id = $1
          AND sports_tool_kit_answers.feeling >= 3
          AND sports_tool_kit_answers.session_date BETWEEN $2
          AND $3
      )
      WHEN tool_kits.tool_kit_type = 'RUNNING' THEN (
        SELECT
          COUNT(running_tool_kit_answers.id)
        FROM
          running_tool_kit_answers
        WHERE
          running_tool_kit_answers.user_id = $1
          AND running_tool_kit_answers.feeling >= 3
          AND running_tool_kit_answers.session_date BETWEEN $2
          AND $3
      )
      WHEN tool_kits.tool_kit_type = 'VIDEO' THEN (
        SELECT
          COUNT(video_tool_kit_answers.id)
        FROM
          video_tool_kit_answers
        WHERE
          video_tool_kit_answers.user_id = $1
          AND video_tool_kit_answers.feeling >= 3
          AND video_tool_kit_answers.session_date BETWEEN $2
          AND $3
      )
      ELSE NULL
    END AS sessions
  FROM
    user_schedule_sessions
    LEFT JOIN tool_kits ON user_schedule_sessions.tool_kit_id = tool_kits.id
  WHERE
    user_schedule_sessions.user_id = $1
    AND user_schedule_sessions.session_date BETWEEN $2
    AND $3
  GROUP BY
    tool_kits.id
  ORDER BY
    sessions DESC NULLS LAST
  LIMIT 3;`;
    const params = [userId, startDate, endDate];
    const result = await this.database.query<{
      toolkits: Toolkit;
    }>(query, params);
    return result;
  }
  getMoodToolkitChartByInsightRangeQuery(insightRange: InsightRange): string {
    const dateField = getMoodChartDateField.get(insightRange) as string;
    return `SELECT EXTRACT( ${dateField} FROM mood_tool_kit_answers.session_date ) AS label,
    MODE() WITHIN GROUP (ORDER BY mood_check_categories.ranking) AS value
    FROM mood_tool_kit_answers
    LEFT JOIN mood_check_categories ON mood_check_categories.id = mood_tool_kit_answers.mood_category_id
    WHERE mood_tool_kit_answers.user_id = $1 AND mood_check_categories.ranking <= 5
    AND mood_tool_kit_answers.session_date BETWEEN $2 AND $3 AND mood_tool_kit_answers.tool_kit_id = $4
    GROUP BY label
    ORDER BY label`;
  }

  getMoodInsightChartByInsightRangeQuery(insightRange: InsightRange): string {
    const dateField = getMoodChartDateField.get(insightRange) as string;
    return `SELECT EXTRACT( ${dateField} FROM user_mood_checks.date ) AS label,
    MODE() WITHIN GROUP (ORDER BY mood_check_categories.ranking) AS value
    FROM user_mood_checks
    LEFT JOIN mood_check_categories ON mood_check_categories.id = user_mood_checks.category_id
    WHERE user_mood_checks.user_id = $1 AND mood_check_categories.ranking <= 5
    AND user_mood_checks.date BETWEEN $2 AND $3
    GROUP BY label
    ORDER BY label`;
  }

  async getMoodInsightsChartByInightRange(
    userId: string,
    startDate: string,
    endDate: string,
    insightRange: InsightRange,
    toolkitId?: string,
  ): Promise<MoodChartData[]> {
    const params = [userId, startDate, endDate];
    let query = this.getMoodInsightChartByInsightRangeQuery(insightRange);
    if (toolkitId) {
      query = this.getMoodToolkitChartByInsightRangeQuery(insightRange);
      params.push(toolkitId);
    }
    const moodChart = await this.database.query<MoodChartData>(query, params);

    return moodChart;
  }

  getMoodToolkitMonthChartQuery(): string {
    return `SELECT  mood_tool_kit_answers.session_date AS label,
          MODE() WITHIN GROUP (ORDER BY mood_check_categories.ranking) AS value
          FROM mood_tool_kit_answers
          LEFT JOIN mood_check_categories ON mood_check_categories.id = mood_tool_kit_answers.mood_category_id
          WHERE mood_tool_kit_answers.user_id = $1 AND mood_check_categories.ranking <= 5
          AND mood_tool_kit_answers.session_date BETWEEN $2 AND $3 AND mood_tool_kit_answers.tool_kit_id = $4
          GROUP BY label
          ORDER BY label`;
  }

  getMoodInsightsMonthChartQuery(): string {
    return `SELECT  user_mood_checks.date AS label,
          MODE() WITHIN GROUP (ORDER BY mood_check_categories.ranking) AS value
          FROM user_mood_checks
          LEFT JOIN mood_check_categories ON mood_check_categories.id = user_mood_checks.category_id
          WHERE user_mood_checks.user_id = $1 AND mood_check_categories.ranking <= 5
          AND user_mood_checks.date BETWEEN $2 AND $3
          GROUP BY label
          ORDER BY label`;
  }

  async getMoodInsightsMonthChart(
    userId: string,
    startDate: string,
    endDate: string,
    toolkitId?: string,
  ): Promise<MoodChartData[]> {
    const params = [userId, startDate, endDate];
    let query = this.getMoodInsightsMonthChartQuery();
    if (toolkitId) {
      query = this.getMoodToolkitMonthChartQuery();
      params.push(toolkitId);
    }
    const moodChart = await this.database.query<MoodChartData>(query, params);
    return moodChart;
  }

  async getMostLoggedMoodAverages(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<{ ranking: number; count: number }[]> {
    const query = `SELECT  mood_check_categories.ranking,COUNT(mood_check_categories.ranking) FROM user_mood_checks
    LEFT JOIN mood_check_categories ON user_mood_checks.category_id = mood_check_categories.id
    WHERE user_mood_checks.user_id =$1 AND user_mood_checks.date BETWEEN DATE( $2 ) AND DATE( $3 )
    AND mood_check_categories.ranking <= 5
    GROUP BY mood_check_categories.ranking
    ORDER BY mood_check_categories.ranking;`;
    const params = [userId, startDate, endDate];
    const result = await this.database.query<{
      ranking: number;
      count: number;
    }>(query, params);
    return result;
  }

  async getAverageDailyMoodGraph(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<DailyMoodBarGraph[]> {
    const query = `SELECT EXTRACT( ISODOW FROM user_mood_checks.date ) AS label,
    MODE() WITHIN GROUP (ORDER BY mood_check_categories.ranking) AS value
    FROM user_mood_checks
    LEFT JOIN mood_check_categories ON mood_check_categories.id = user_mood_checks.category_id
    WHERE user_mood_checks.user_id = $1 AND mood_check_categories.ranking <= 5
    AND user_mood_checks.date BETWEEN $2 AND $3
    GROUP BY label
    ORDER BY label`;
    const params = [userId, startDate, endDate];
    const result = await this.database.query<DailyMoodBarGraph>(query, params);
    return result;
  }

  async getStepsVsMoodGraph(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<StepsVsMoodGraph[]> {
    const query = `SELECT EXTRACT( ISODOW FROM steps_tool_kit_answers.session_date ) AS label,
    COALESCE(ROUND(AVG(steps_tool_kit_answers.steps)), 0) AS value,
    MODE() WITHIN GROUP (ORDER BY steps_tool_kit_answers.feeling) AS emoji
    FROM steps_tool_kit_answers
    WHERE steps_tool_kit_answers.user_id = $1
    AND steps_tool_kit_answers.session_date BETWEEN $2 AND $3
    GROUP BY label
    ORDER BY label`;
    const params = [userId, startDate, endDate];
    const result = await this.database.query<StepsVsMoodGraph>(query, params);
    return result;
  }

  async getActivityVsMoodGraph(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<ActivityVsMoodGraph[]> {
    const query = `SELECT EXTRACT( ISODOW FROM activity_tool_kit_answers.session_date ) AS label,
    COALESCE(ROUND(AVG(activity_tool_kit_answers.consumed_duration)), 0) AS value,
    MODE() WITHIN GROUP (ORDER BY activity_tool_kit_answers.feeling) AS emoji
    FROM activity_tool_kit_answers
    WHERE activity_tool_kit_answers.user_id = $1
    AND activity_tool_kit_answers.session_date BETWEEN $2 AND $3
    GROUP BY label
    ORDER BY label`;
    const params = [userId, startDate, endDate];
    const result = await this.database.query<ActivityVsMoodGraph>(
      query,
      params,
    );
    return result;
  }

  async getSleepVsMoodGraph(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<SleepHourVsMoodGraph[]> {
    const query = `SELECT EXTRACT( ISODOW FROM sleep_check_tool_kit_answers.session_date ) AS label,
    COALESCE(ROUND(AVG(sleep_check_tool_kit_answers.total_sleep_time)), 0) AS value,
    MODE() WITHIN GROUP (ORDER BY sleep_check_tool_kit_answers.quality_of_sleep) AS emoji
    FROM sleep_check_tool_kit_answers
    WHERE sleep_check_tool_kit_answers.user_id = $1
    AND sleep_check_tool_kit_answers.session_date BETWEEN $2 AND $3
    GROUP BY label
    ORDER BY label;`;
    const params = [userId, startDate, endDate];
    const result = await this.database.query<SleepHourVsMoodGraph>(
      query,
      params,
    );
    return result;
  }
  async getNightActivity(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<{ activity: string }[]> {
    const query = `SELECT activity FROM (SELECT night_activity FROM sleep_check_tool_kit_answers WHERE sleep_check_tool_kit_answers.user_id=$1 AND sleep_check_tool_kit_answers.session_date BETWEEN $2 AND $3) sleep_answers
    ,UNNEST(sleep_answers.night_activity) as activity group by activity`;
    const nightActivity = await this.database.query<{ activity: string }>(
      query,
      [userId, startDate, endDate],
    );
    return nightActivity;
  }

  async getSleepAverageTime(
    userId: string,
    startDate: string,
    endDate: string,
    field: SleepTimeField,
  ): Promise<string> {
    const query = `SELECT COALESCE(to_timestamp(AVG(tt))::time with time zone,'00:00') AS average  FROM (
        SELECT EXTRACT(EPOCH FROM (session_date::timestamp::date+"${field}")) AS tt FROM sleep_check_tool_kit_answers WHERE ${field} IS NOT NULL AND sleep_check_tool_kit_answers.user_id=$1 AND sleep_check_tool_kit_answers.session_date BETWEEN $2 AND $3
        ) sleep_answers`;
    const [averageTime] = await this.database.query<{ average: string }>(
      query,
      [userId, startDate, endDate],
    );
    return averageTime.average;
  }

  async getAverageDeepSleep(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<{ avg_deep_sleep: number }> {
    const params = [userId, startDate, endDate];
    const query = `SELECT COALESCE(ROUND(AVG(sleep_check_tool_kit_answers.deep_sleep_time)), 0) as avg_deep_sleep
    FROM sleep_check_tool_kit_answers
    WHERE sleep_check_tool_kit_answers.user_id = $1
    AND sleep_check_tool_kit_answers.session_date BETWEEN $2 AND $3;`;
    const [deepSleep] = await this.database.query<{ avg_deep_sleep: number }>(
      query,
      params,
    );
    return deepSleep;
  }

  async getAverageTotalSleep(
    userId: string,
    startDate: string,
    endDate: string,
  ): Promise<{ sleep_time: number }> {
    const params = [userId, startDate, endDate];
    const query = `SELECT COALESCE(ROUND(AVG(sleep_check_tool_kit_answers.total_sleep_time)), 0) as sleep_time
    FROM sleep_check_tool_kit_answers
    WHERE sleep_check_tool_kit_answers.user_id = $1
    AND sleep_check_tool_kit_answers.session_date BETWEEN $2 AND $3;`;
    const [totalSleep] = await this.database.query<{ sleep_time: number }>(
      query,
      params,
    );
    return totalSleep;
  }

  async getUserById(userId: string): Promise<Users> {
    const query = `SELECT * FROM users where id = $1`;
    const [user] = await this.database.query<Users>(query, [userId]);
    return user;
  }
}
