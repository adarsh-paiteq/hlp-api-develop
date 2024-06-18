import { Module } from '@nestjs/common';
import { AuthModule } from '@shared/auth/auth.module';
import { GoalsModule } from '../goals/goals.module';
import { InsightsRepo } from './insights.repo';
import { InsightsResolver } from './insights.resolver';
import { InsightsService } from './insights.service';

@Module({
  controllers: [],
  providers: [InsightsResolver, InsightsService, InsightsRepo],
  imports: [AuthModule, GoalsModule],
  exports: [InsightsService],
})
export class InsightsModule {}
