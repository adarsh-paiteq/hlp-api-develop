import { Injectable, Logger } from '@nestjs/common';
import { UserSessionLogsRepo } from './user-session-logs.repo';
import { RobotPageType } from '../robots/entities/robot.entity';

@Injectable()
export class UserSessionLogsService {
  private readonly logger = new Logger(UserSessionLogsService.name);
  constructor(private readonly userSessionLogsRepo: UserSessionLogsRepo) {}

  async addLog(
    userId: string,
    date: string,
    page?: RobotPageType,
  ): Promise<void> {
    const logExists = await this.userSessionLogsRepo.getUserSessionLogByDate(
      userId,
      date,
      page,
    );
    const lastActive = new Date().toISOString();
    if (logExists) {
      await this.userSessionLogsRepo.updateUserSessionLogLastActive(
        userId,
        lastActive,
        page,
      );
      this.logger.log(`Session exists ,last_active updated to ${lastActive}`);
      return;
    }
    await this.userSessionLogsRepo.addUserSessionLog(
      userId,
      date,
      lastActive,
      page,
    );
    this.logger.log(`Session log added for ${userId} on ${date}`);
  }
}
