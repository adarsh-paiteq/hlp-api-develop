import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { ApiHealthIndicator } from './api-health.indicator';

@Module({
  controllers: [HealthController],
  providers: [ApiHealthIndicator],
  imports: [TerminusModule.forRoot({ logger: true, errorLogStyle: 'json' })],
})
export class HealthModule {}
