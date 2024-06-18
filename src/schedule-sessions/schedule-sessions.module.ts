import { Module } from '@nestjs/common';
import { ScheduleSessionsService } from './schedule-sessions.service';
import { ScheduleSessionsController } from './schedule-sessions.controller';
import { ScheduleSessionsRepo } from './schedule-sessions.repo';
import { HasuraService } from '../shared/services/hasura/hasura.service';

@Module({
  controllers: [ScheduleSessionsController],
  providers: [ScheduleSessionsService, ScheduleSessionsRepo, HasuraService],
  exports: [ScheduleSessionsRepo],
})
export class ScheduleSessionsModule {}
