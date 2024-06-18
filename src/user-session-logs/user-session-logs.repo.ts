import { Injectable } from '@nestjs/common';
import { Database } from '../core/modules/database/database.service';
import { UserSessionLog } from './entities/user-session-log.entity';
import { RobotPageType } from '../robots/entities/robot.entity';

@Injectable()
export class UserSessionLogsRepo {
  constructor(private readonly database: Database) {}

  async addUserSessionLog(
    userId: string,
    date: string,
    last_active: string,
    page?: RobotPageType,
  ): Promise<UserSessionLog> {
    const query = `INSERT INTO user_session_logs (user_id,date,last_active,page) VALUES ($1,$2,$3,$4)`;
    const [userSessionLog] = await this.database.query<UserSessionLog>(query, [
      userId,
      date,
      last_active,
      page,
    ]);
    return userSessionLog;
  }

  async updateUserSessionLogLastActive(
    userId: string,
    last_active: string,
    page?: RobotPageType,
  ): Promise<UserSessionLog> {
    const params = [userId, last_active];
    let query = `UPDATE user_session_logs SET last_active=$2 WHERE user_id=$1`;
    if (page) {
      query += `AND page=$3`;
      params.push(page);
    }
    const [userSessionLog] = await this.database.query<UserSessionLog>(
      query,
      params,
    );
    return userSessionLog;
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
}
