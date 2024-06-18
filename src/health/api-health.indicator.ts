import { Inject, Injectable } from '@nestjs/common';
import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { default as Redis } from 'ioredis';
import { Database } from '../core/modules/database/database.service';
import { REDIS } from '../core/modules/redis/redis.provider';

@Injectable()
export class ApiHealthIndicator extends HealthIndicator {
  constructor(
    private readonly database: Database,
    @Inject(REDIS) private readonly redis: Redis,
  ) {
    super();
  }

  private async getData(table: string): Promise<unknown> {
    const query = `SELECT * FROM ${table} LIMIT 1; `;
    const [data] = await this.database.query<unknown>(query);
    return data;
  }

  async isDatabaseHealthy(table: string): Promise<HealthIndicatorResult> {
    const data = await this.getData(table);
    const isOkay = data !== undefined;
    const result = this.getStatus('Database', isOkay, {
      data: `Database ready`,
    });
    if (!data) {
      throw new HealthCheckError(`Database unavailable`, result);
    }
    return result;
  }

  async isReddisHealthy(): Promise<HealthIndicatorResult> {
    const isHealthy = this.redis.status === 'ready';
    const result = this.getStatus('Redis', isHealthy, {
      data: `Redis ready`,
    });
    if (!isHealthy) {
      throw new HealthCheckError(`Redis unavailable`, result);
    }
    return result;
  }
}
