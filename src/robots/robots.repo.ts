import { Database } from '@core/modules/database/database.service';
import { Injectable } from '@nestjs/common';
import { UserRobotLog } from '../user-robot-logs/entities/user-robot-log.entity';
import { UserSessionLog } from '../user-session-logs/entities/user-session-log.entity';
import { Users } from '../users/users.model';
import {
  HaveANiceDayRobot,
  RobotEntity as Robot,
  RobotPageType,
  RobotType,
  TopTipOfTheDayRobotEntity as TopTipOfTheDayRobot,
} from './entities/robot.entity';
import { Toolkit } from '../toolkits/toolkits.model';
import {
  UserScheduleWithToolkit,
  ReminderScheduleToolkit,
  ToolkitAndGoal,
  UserFlowChartRobot,
} from './dto/robots.dto';
import { Schedule } from '../schedules/schedules.model';
import { ServiceCompany } from '../service-offers/entities/service-company.entity';
import { UserScheduleSession } from '../schedule-sessions/entities/user-schedule-sessions.entity';
import { FlowChartRobot } from './entities/flow-chart-robot.entity';
import { FlowChartRobotInput } from './dto/add-flow-chart-robot.dto';
import { UserRobotLogDto } from '../user-robot-logs/dto/user-robot-log.dto';
import {
  UserNotification,
  UserNotificationType,
} from '@notifications/entities/user-notifications.entity';

@Injectable()
export class RobotsRepo {
  constructor(private readonly database: Database) {}

  async getUserById(userId: string): Promise<Users> {
    const query = `SELECT * FROM users WHERE id=$1`;
    const [user] = await this.database.query<Users>(query, [userId]);
    return user;
  }

  async getUserSessionLogByDate(
    userId: string,
    date: string,
    page?: RobotPageType,
  ): Promise<UserSessionLog> {
    const params = [userId, date];
    let query = `SELECT * FROM user_session_logs WHERE user_id=$1 AND date=$2`;
    if (page) {
      query += `AND page=$3`;
      params.push(page);
    }
    const [sessionLog] = await this.database.query<UserSessionLog>(
      query,
      params,
    );
    return sessionLog;
  }

  async getLastUserSessionLog(userId: string): Promise<UserSessionLog> {
    const query = `SELECT * FROM user_session_logs WHERE user_id=$1 ORDER BY date DESC LIMIT 1`;
    const [sessionLog] = await this.database.query<UserSessionLog>(query, [
      userId,
    ]);
    return sessionLog;
  }

  async getUserRobotLogBySessionLogId(
    sessionLogId: string,
  ): Promise<UserRobotLog> {
    const query = `SELECT * FROM user_robot_logs WHERE session_log_id=$1`;
    const [userRobotLog] = await this.database.query<UserRobotLog>(query, [
      sessionLogId,
    ]);
    return userRobotLog;
  }

  async getOnboardingRobotLog(
    userId: string,
    page?: RobotPageType,
  ): Promise<UserRobotLog> {
    const params = [userId, RobotType.ONBOARDING];
    let query = `SELECT * FROM user_robot_logs WHERE user_id=$1 AND robot_type=$2`;
    if (page) {
      query += `AND page=$3;`;
      params.push(page);
    }
    const [robotLog] = await this.database.query<UserRobotLog>(query, params);
    return robotLog;
  }

  async getRobotLog(
    userId: string,
    date: string,
    robotType: string,
    page?: RobotPageType,
  ): Promise<UserRobotLog> {
    let query = `SELECT * FROM user_robot_logs WHERE user_id=$1 AND robot_type=$2 AND date=$3`;
    const params = [userId, robotType, date];
    if (page) {
      query += `AND page=$4`;
      params.push(page);
    }
    const [robotLog] = await this.database.query<UserRobotLog>(query, params);
    return robotLog;
  }

  async getOnboardingRobots(page?: RobotPageType): Promise<Robot[]> {
    const query = `SELECT * FROM onboarding_robots
    ${page ? 'WHERE page=$1' : 'WHERE page IS NULL'}
     ORDER BY sequence ASC`;
    const params = [];
    if (page) {
      params.push(page);
    }
    const robots = await this.database.query<Robot>(query, params);
    return robots;
  }

  async getDailyRobots(page?: RobotPageType): Promise<Robot[]> {
    const query = `SELECT * FROM first_time_daily_robots
     ${page ? 'WHERE page=$1' : 'WHERE page IS NULL'}
     ORDER BY sequence ASC`;
    const params = [];
    if (page) {
      params.push(page);
    }
    const robots = await this.database.query<Robot>(query, params);
    return robots;
  }

  async getToolkitById(toolkitId: string): Promise<Toolkit> {
    const query = `SELECT * FROM tool_kits WHERE id=$1`;
    const [toolkit] = await this.database.query<Toolkit>(query, [toolkitId]);
    return toolkit;
  }

  async isAgendaEmpty(
    userId: string,
    dateString: string,
    weekday: string,
    day: number,
  ): Promise<boolean> {
    const query = `SELECT schedules.* FROM schedules
    WHERE schedules.start_date <= $2 ::date AND schedules.user= $1
    AND schedules.is_schedule_disabled = $5
    AND(
      $3 = ANY(repeat_per_month)
    OR $4 = ANY(schedule_days)
    OR (schedules.schedule_type='DAILY')
    OR (schedules.schedule_type = 'ONETIME' AND schedules.start_date =  $2 ))
    ORDER BY schedules.start_date DESC
    LIMIT 1`;
    const schedules = await this.database.query<Schedule>(query, [
      userId,
      dateString,
      day,
      weekday,
      false,
    ]);
    return schedules.length > 0;
  }

  async isLogDone(userId: string, dateString: string): Promise<boolean> {
    const query = `SELECT user_schedule_sessions.*
      FROM user_schedule_sessions
        LEFT JOIN tool_kits ON tool_kits.id = user_schedule_sessions.tool_kit_id
      WHERE
       tool_kits.tool_kit_type IN (
          'MEDICATION',
          'SLEEP_CHECK',
          'BLOOD_PRESSURE',
          'HEART_RATE',
          'STEPS',
          'WEIGHT'
        )
        AND user_schedule_sessions.user_id = $1
        AND user_schedule_sessions.session_date = $2 `;
    const response = await this.database.query<UserScheduleSession>(query, [
      userId,
      dateString,
    ]);
    return response.length > 0;
  }

  async getActiveUserScheduleWithToolkitForCheckInRobot(
    userId: string,
    dateString: string,
  ): Promise<UserScheduleWithToolkit> {
    const query = `SELECT
    ROW_TO_JSON(schedules.*) as schedule,
    ROW_TO_JSON(tool_kits.*) as toolkit
    FROM schedules
      LEFT JOIN tool_kits ON tool_kits.id = schedules.tool_kit
    WHERE
     tool_kits.tool_kit_type IN (
        'MEDICATION',
        'SLEEP_CHECK',
        'BLOOD_PRESSURE',
        'HEART_RATE',
        'STEPS',
        'WEIGHT'
      )
      AND schedules.user = $1
      AND (
        schedules.is_schedule_disabled = false
        OR (
          schedules.is_schedule_disabled = true
          AND schedules.end_date ::DATE > $2 ::DATE
        )
      )
      GROUP BY schedules.id, tool_kits.id
    ORDER BY schedules.created_at DESC
    LIMIT 1`;
    const [userScheduleAndToolkit] =
      await this.database.query<UserScheduleWithToolkit>(query, [
        userId,
        dateString,
      ]);
    return userScheduleAndToolkit;
  }

  async getReminderScheduleAndToolkit(
    userId: string,
    date: string,
  ): Promise<ReminderScheduleToolkit> {
    const query = `SELECT
    to_json(schedules.*) AS schedule,
    to_json(tool_kits.*) AS toolkit
  FROM
    schedule_reminders
    LEFT JOIN schedules ON schedule_reminders.schedule_id = schedules.id
    LEFT JOIN user_schedule_sessions ON schedules.id = user_schedule_sessions.schedule_id
    LEFT JOIN tool_kits ON schedules.tool_kit = tool_kits.id
  WHERE
    schedule_reminders.user_id = $1
    AND schedule_reminders.reminder_time >= $2
    AND schedule_reminders.reminder_time ::DATE = $2 ::DATE
    AND(
      schedules.is_schedule_disabled = false
      OR(
        schedules.is_schedule_disabled = true
        AND schedules.end_date ::DATE > $2 ::DATE
      )
    )
    AND user_schedule_sessions.schedule_id IS NULL
  ORDER BY
    schedule_reminders.reminder_time ASC
  LIMIT 1`;
    const [response] = await this.database.query<ReminderScheduleToolkit>(
      query,
      [userId, date],
    );
    return response;
  }

  async getTookitAndGoalByUserId(userId: string): Promise<ToolkitAndGoal> {
    const query = `SELECT to_json(tool_kits.*) AS toolkit, to_json(goals.*) AS goal
    FROM user_goals
    LEFT JOIN goals ON user_goals.goal = goals.id
    LEFT JOIN tool_kits ON goals.id = tool_kits.goal_id
    WHERE user_goals.user_id = $1 AND user_goals.is_selected = $2
    ORDER BY user_goals.created_at DESC
    LIMIT 1
    `;
    const [toolkitAndGoal] = await this.database.query<ToolkitAndGoal>(query, [
      userId,
      true,
    ]);
    return toolkitAndGoal;
  }

  async getTopTipOfTheRobot(
    dateString: string,
    page?: RobotPageType,
  ): Promise<TopTipOfTheDayRobot[]> {
    const params = [dateString];
    const query = `SELECT * FROM top_tip_of_the_day WHERE date =$1 ${
      page ? 'AND page=$2' : 'AND page IS NULL'
    }
    ORDER BY created_at DESC;`;
    if (page) {
      params.push(page);
    }
    const tipTopRobots = await this.database.query<TopTipOfTheDayRobot>(
      query,
      params,
    );
    return tipTopRobots;
  }

  async getHaveNiceDayRobot(): Promise<HaveANiceDayRobot> {
    const query = `SELECT * FROM have_a_nice_day_robot ORDER BY created_at DESC LIMIT 1`;
    const [haveNiceDayRobot] = await this.database.query<HaveANiceDayRobot>(
      query,
    );
    return haveNiceDayRobot;
  }

  async getServiceCompanyByServiceId(
    serviceId: string,
  ): Promise<ServiceCompany> {
    const query = `SELECT service_companies.* FROM services
    LEFT JOIN service_companies ON services.service_company_id = service_companies.id
    WHERE services.id= $1`;
    const [serviceCompany] = await this.database.query<ServiceCompany>(query, [
      serviceId,
    ]);
    return serviceCompany;
  }

  async getFlowChartRobotsByIds(ids: string[]): Promise<FlowChartRobot[]> {
    const query = `SELECT * FROM flow_chart_robots WHERE id=ANY($1::uuid[])`;
    const robots = await this.database.query<FlowChartRobot>(query, [ids]);
    return robots;
  }

  async saveFlowChartRobot(
    robot: Omit<FlowChartRobotInput, 'buttons'> & { buttons: string },
  ): Promise<FlowChartRobot> {
    const params = Object.values(robot);
    const keys = Object.keys(robot);
    const query = `INSERT INTO flow_chart_robots (${keys.join(
      ',',
    )}) VALUES (${keys.map((key, index) => `$${index + 1}`)}) RETURNING *`;
    const [savedRobot] = await this.database.query<FlowChartRobot>(
      query,
      params,
    );
    return savedRobot;
  }

  async updateFlowChartRobot(
    id: string,
    robot: Omit<FlowChartRobotInput, 'buttons'> & { buttons: string },
  ): Promise<FlowChartRobot> {
    const params = Object.values(robot);
    const keys = Object.keys(robot);
    const query = `UPDATE  flow_chart_robots SET ${keys
      .map((key, index) => `${key}=$${index + 2}`)
      .join(',')} WHERE id=$1  RETURNING *`;
    const [savedRobot] = await this.database.query<FlowChartRobot>(query, [
      id,
      ...params,
    ]);
    return savedRobot;
  }

  async isFlowChartRobotLinked(id: string): Promise<FlowChartRobot> {
    const query = `SELECT * FROM flow_chart_robots
    WHERE buttons @> '[{"robot_id":"${id}"}]'
    `;
    const [robot] = await this.database.query<FlowChartRobot>(query, []);
    return robot;
  }

  async deleteFlowChartRobot(id: string): Promise<FlowChartRobot> {
    const query = `DELETE FROM flow_chart_robots WHERE id=$1 RETURNING *;`;
    const [robot] = await this.database.query<FlowChartRobot>(query, [id]);
    return robot;
  }

  async getFlowChartRobotLog(
    userId: string,
    robotId: string,
  ): Promise<UserRobotLog> {
    const query = `SELECT * FROM user_robot_logs WHERE user_id=$1 AND robot_id=$2`;
    const params = [userId, robotId];
    const [robotLog] = await this.database.query<UserRobotLog>(query, params);
    return robotLog;
  }

  async addUserRobotLog(log: UserRobotLogDto): Promise<UserRobotLog> {
    const query = `INSERT INTO user_robot_logs (${Object.keys(
      log,
    ).toString()}) VALUES (${Object.keys(log)
      .map((value, index) => `$${index + 1}`)
      .toString()}) RETURNING *;`;
    const [savedLog] = await this.database.query<UserRobotLog>(
      query,
      Object.values(log),
    );
    return savedLog;
  }

  async getUserFlowChartRobots(userId: string): Promise<UserFlowChartRobot[]> {
    const query = `SELECT flow_chart_robots.*,
    CASE
    WHEN flow_chart_robots.id=user_robot_logs.robot_id THEN true ELSE false
    END AS is_completed
    FROM flow_chart_robots LEFT JOIN user_robot_logs ON user_robot_logs.user_id=$1 AND user_robot_logs.robot_id=flow_chart_robots.id WHERE flow_chart_robots.is_start_node=true ORDER BY is_completed ASC`;
    const robots = await this.database.query<UserFlowChartRobot>(query, [
      userId,
    ]);
    return robots;
  }

  async getUnreadTreatmentTimelineRobotNotification(
    userId: string,
  ): Promise<UserNotification> {
    const query = `
    SELECT * FROM user_notifications 
    WHERE user_notifications.user_id=$1 
      AND user_notifications.is_robot_read=$2 
      AND user_notifications.type=$3 
    ORDER BY created_at DESC LIMIT 1;`;
    const [userNotificationRobots] =
      await this.database.query<UserNotification>(query, [
        userId,
        false,
        UserNotificationType.TREATMENT_TIMELINE,
      ]);
    return userNotificationRobots;
  }

  async updateUserNotificationRobotStatus(
    userId: string,
  ): Promise<UserNotification> {
    const query = `
    UPDATE user_notifications SET is_robot_read=$1
    WHERE user_notifications.user_id=$2
      AND user_notifications.is_robot_read=$3
      AND user_notifications.type=$4`;
    const [userNotificationRobots] =
      await this.database.query<UserNotification>(query, [
        true,
        userId,
        false,
        UserNotificationType.TREATMENT_TIMELINE,
      ]);
    return userNotificationRobots;
  }
}
