import { Injectable } from '@nestjs/common';
import { Database } from '../core/modules/database/database.service';
import { RobotType } from '../robots/entities/robot.entity';
import { UserRobotLogDto } from './dto/user-robot-log.dto';
import { UserRobotLog } from './entities/user-robot-log.entity';

@Injectable()
export class UserRobotLogsRepo {
  constructor(private readonly database: Database) {}

  async addLog(log: UserRobotLogDto): Promise<UserRobotLog> {
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

  async deleteOnboardingRobotLog(userId: string): Promise<void> {
    const query = `DELETE FROM user_robot_logs WHERE user_id=$1 AND robot_type=$2`;
    await this.database.query(query, [userId, RobotType.ONBOARDING]);
  }
}
