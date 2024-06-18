import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS } from '../core/modules/redis/redis.provider';
import { robotOnboardingRobotLogHashKey } from '../robots/dto/robots.dto';
import { UserRobotLogDto } from './dto/user-robot-log.dto';
import { UserRobotLog } from './entities/user-robot-log.entity';
import { UserRobotLogsRepo } from './user-robot-logs.repo';
import { RobotPageType } from '../robots/entities/robot.entity';

@Injectable()
export class UserRobotLogsService {
  constructor(
    private readonly userRobotLogsRepo: UserRobotLogsRepo,
    @Inject(REDIS) private readonly redis: Redis,
  ) {}

  async addLog(log: UserRobotLogDto): Promise<UserRobotLog> {
    const savedLog = await this.userRobotLogsRepo.addLog(log);
    return savedLog;
  }

  async clearOnboardingRobotLog(
    userId: string,
    page?: RobotPageType,
  ): Promise<string> {
    await Promise.all([
      this.redis.hdel(robotOnboardingRobotLogHashKey(page), userId),
      this.userRobotLogsRepo.deleteOnboardingRobotLog(userId),
    ]);
    return 'cleared';
  }
}
