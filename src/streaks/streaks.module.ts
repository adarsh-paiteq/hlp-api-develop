import { Module } from '@nestjs/common';
import { StreaksService } from './streaks.service';
import { StreaksController } from './streaks.controller';
import { HasuraService } from '../shared/services/hasura/hasura.service';
import { StreaksRepo } from './streaks.repo';
import { ScheduleSessionsModule } from '../schedule-sessions/schedule-sessions.module';
import { StreaksEventListener } from './streak.listener';

import { registerStreaksQueue, StreaksQueue } from './streaks.queue';
import { StreaksProcessor } from './streaks.processor';

@Module({
  imports: [ScheduleSessionsModule, registerStreaksQueue],
  controllers: [StreaksController],
  providers: [
    StreaksService,
    HasuraService,
    StreaksRepo,
    StreaksEventListener,
    StreaksQueue,
    StreaksProcessor,
  ],
  exports: [StreaksRepo, registerStreaksQueue],
})
export class StreaksModule {}
