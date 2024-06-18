import { Module } from '@nestjs/common';
import { CheckinsService } from './checkins.service';
import { CheckinsController } from './checkins.controller';
import { HasuraService } from '../shared/services/hasura/hasura.service';
import { CheckinsRepo } from './checkins.repo';
import { AuthModule } from '../shared/auth/auth.module';
import { CheckinsListener } from './checkins.listeners';
import { CheckinsQueue, registerCheckinsQueue } from './checkins.queue';
import { CheckinsProcessor } from './checkins.processors';
import { CheckinsResolver } from './checkins.resolver';
import { ToolkitModule } from '../toolkits/toolkit.module';
import { UtilsModule } from '../utils/utils.module';

@Module({
  controllers: [CheckinsController],
  providers: [
    CheckinsService,
    HasuraService,
    CheckinsRepo,
    CheckinsListener,
    CheckinsQueue,
    CheckinsProcessor,
    CheckinsResolver,
  ],
  imports: [registerCheckinsQueue, AuthModule, ToolkitModule, UtilsModule],
  exports: [registerCheckinsQueue],
})
export class CheckinsModule {}
