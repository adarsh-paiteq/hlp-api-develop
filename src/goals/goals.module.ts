import { Module } from '@nestjs/common';
import { GoalsService } from './goals.service';
import { GoalsController } from './goals.controller';
import { HasuraService } from '../shared/services/hasura/hasura.service';
import { GoalsRepo } from './goals.repo';
import { AuthModule } from '../shared/auth/auth.module';
import { GoalsListener } from './goals.listener';
import { GoalsProcessor } from './goals.processor';
import { GoalsQueue, registerGoalsQueue } from './goals.queue';
import { GoalsResolver } from './goals.resolver';

@Module({
  controllers: [GoalsController],
  providers: [
    GoalsService,
    HasuraService,
    GoalsRepo,
    GoalsProcessor,
    GoalsQueue,
    GoalsListener,
    GoalsResolver,
  ],
  imports: [AuthModule, registerGoalsQueue],
  exports: [GoalsRepo, GoalsService, registerGoalsQueue],
})
export class GoalsModule {}
