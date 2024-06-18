import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { Public } from '../shared/decorators/public.decorator';
import { ApiHealthIndicator } from './api-health.indicator';

@Controller('health')
export class HealthController {
  constructor(
    private readonly db: ApiHealthIndicator,
    private readonly healthService: HealthCheckService,
  ) {}

  @Get()
  @Public()
  @HealthCheck()
  healthCheck(): Promise<HealthCheckResult> {
    return this.healthService.check([
      (): Promise<HealthIndicatorResult> => this.db.isDatabaseHealthy('users'),
      (): Promise<HealthIndicatorResult> => this.db.isReddisHealthy(),
    ]);
  }
}
