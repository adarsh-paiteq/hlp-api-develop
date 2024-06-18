import { Inject, Injectable, Logger } from '@nestjs/common';
import { default as Redis } from 'ioredis';
import { REDIS } from '@core/modules/redis/redis.provider';
import { RobotsRepo } from './robots.repo';
import { Users } from '../users/users.model';
import { UserSessionLog } from '../user-session-logs/entities/user-session-log.entity';
import { UserRobotLog } from '../user-robot-logs/entities/user-robot-log.entity';
import { RobotGreeting } from './enums/robot-gretting.enum';

import { DateTime } from 'luxon';
import {
  getRobotUserSessionLogCacheKey,
  robotOnboardingRobotLogHashKey,
  robotToolkitCacheKey,
  robotUserCacheKey,
} from './dto/robots.dto';
import { Toolkit } from '../toolkits/toolkits.model';
import { ConfigService } from '@nestjs/config';
import { Environment, EnvVariable } from '../core/configs/config';
import { RobotPageType } from './entities/robot.entity';

@Injectable()
export class RobotsHelper {
  private readonly logger = new Logger(RobotsHelper.name);
  constructor(
    @Inject(REDIS) private readonly redis: Redis,
    private readonly robotsRepo: RobotsRepo,
    private readonly configService: ConfigService,
  ) {}

  async getUser(userId: string): Promise<Users> {
    const key = `${robotUserCacheKey}${userId}`;
    const cachedUser = await this.redis.get(key);
    if (cachedUser) {
      this.logger.log(`user from cache`);
      return JSON.parse(cachedUser);
    }
    const user = await this.robotsRepo.getUserById(userId);
    if (user) {
      this.logger.log(`user from db`);
      await this.redis.setex(key, 3000, JSON.stringify(user));
    }
    return user;
  }

  async getUserSessionLog(
    userId: string,
    date: string,
    page?: RobotPageType,
  ): Promise<UserSessionLog> {
    const key = getRobotUserSessionLogCacheKey(userId, date, page);
    const cachedSessionLog = await this.redis.get(key);
    if (cachedSessionLog) {
      this.logger.log(`usersession log from cache`);
      return JSON.parse(cachedSessionLog);
    }
    const sessionLog = await this.robotsRepo.getUserSessionLogByDate(
      userId,
      date,
      page,
    );
    if (sessionLog) {
      this.logger.log(`onboarding log from db`);
      const dayInSeconds = 86400;
      await this.redis.setex(key, dayInSeconds, JSON.stringify(sessionLog));
    }
    return sessionLog;
  }

  async getOnboardingRobotLog(
    userId: string,
    page?: RobotPageType,
  ): Promise<UserRobotLog> {
    const hkey = robotOnboardingRobotLogHashKey(page);
    const cachedRobotLog = await this.redis.hget(hkey, userId);
    if (cachedRobotLog) {
      this.logger.log(`onboarding log from cache`);
      return JSON.parse(cachedRobotLog);
    }
    const robotLog = await this.robotsRepo.getOnboardingRobotLog(userId, page);
    if (robotLog) {
      this.logger.log(`onboarding log from db`);
      await this.redis.hset(hkey, userId, JSON.stringify(robotLog));
    }
    return robotLog;
  }

  getGreetingMessage(dateString: string): string {
    const zonedDate = DateTime.fromISO(dateString, { setZone: true });
    const hour = zonedDate.hour;
    if (hour < 12) {
      return RobotGreeting.MORNING;
    }
    if (hour >= 12 && hour < 17) {
      return RobotGreeting.NOON;
    }
    return RobotGreeting.EVENING;
  }

  getDuration(startDate: string, endDate: string): number {
    const start = DateTime.fromJSDate(new Date(startDate)).toUTC();
    const end = DateTime.fromISO(endDate).toUTC();
    const { days } = end.diff(start, 'days');
    return days;
  }

  async getToolkit(toolkitId: string): Promise<Toolkit> {
    const key = `${robotToolkitCacheKey}${toolkitId}`;
    const cachedToolkit = await this.redis.get(key);
    if (cachedToolkit) {
      this.logger.log(`toolkit from cache`);
      return JSON.parse(cachedToolkit);
    }
    const toolkit = await this.robotsRepo.getToolkitById(toolkitId);
    if (toolkit) {
      this.logger.log(`toolkit from db`);
      await this.redis.setex(key, 3000, JSON.stringify(toolkit));
    }
    return toolkit;
  }

  isProd(): boolean {
    const env = this.configService.get<string>(EnvVariable.NODE_ENV);
    return env !== undefined && env === Environment.PODUCTION;
  }
}
