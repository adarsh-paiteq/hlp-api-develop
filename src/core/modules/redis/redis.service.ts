import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { REDIS } from './redis.provider';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private readonly activeUsers = 'active:users';
  private readonly notificationCount = 'notification:count';
  private logger = new Logger(RedisService.name);

  constructor(@Inject(REDIS) private readonly redis: Redis) {}

  async onModuleInit(): Promise<void> {
    await this.del(this.activeUsers);
    this.logger.log(`Cleared active users data.`);
  }

  async incBy(key: string, value = 1): Promise<number> {
    const window = 60;
    await this.redis.expire(key, window, 'NX');
    return await this.redis.incrby(key, value);
  }

  async setEx(
    key: string,
    value: string | number,
    expiration: number,
  ): Promise<void> {
    await this.redis.set(key, value, 'EX', expiration);
  }

  async get(key: string): Promise<string | null> {
    return await this.redis.get(key);
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  getActiveUsersKey(): string {
    return this.activeUsers;
  }

  getNotificationCountKey(): string {
    return this.notificationCount;
  }

  getDigidSessionLogKey(userId: string): string {
    const key = `digid_session_log#${userId}`;
    return key;
  }

  async hget(
    key: string,
    field: string | Buffer,
  ): Promise<string | number | null> {
    return await this.redis.hget(key, field);
  }

  async hdel(key: string, fields: string | Buffer): Promise<void> {
    await this.redis.hdel(key, fields);
  }

  async hset(key: string, object: object): Promise<void> {
    await this.redis.hset(key, object);
  }
}
