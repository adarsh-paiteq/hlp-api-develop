import { Module } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { SchedulesController } from './schedules.controller';
import { SchedulesRepo } from './schedules.repo';
import { HasuraService } from '../shared/services/hasura/hasura.service';
import { registerSchedulesQueue, SchedulesQueue } from './schedules.queue';
import { SchedulesProcessor } from './schedule.processor';

import { SchedulesReminderSevice } from './schedules-reminder.service';

import { SchedulesListener } from './schedules.listener';
import { AuthModule } from '../shared/auth/auth.module';
import { UtilsModule } from '../utils/utils.module';
import { SchedulesResolver } from './schedules.resolver';
import { RobotsModule } from '../robots/robots.module';
import { ChannelsModule } from '@channels/channels.module';

@Module({
  controllers: [SchedulesController],
  providers: [
    SchedulesService,
    SchedulesRepo,
    HasuraService,
    SchedulesQueue,
    SchedulesProcessor,
    SchedulesReminderSevice,
    SchedulesListener,
    SchedulesResolver,
  ],
  exports: [
    SchedulesService,
    SchedulesRepo,
    SchedulesQueue,
    registerSchedulesQueue,
  ],
  imports: [
    registerSchedulesQueue,
    AuthModule,
    UtilsModule,
    RobotsModule,
    ChannelsModule,
  ],
})
export class SchedulesModule {}
