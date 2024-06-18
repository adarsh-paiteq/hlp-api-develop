import { forwardRef, Module } from '@nestjs/common';
import { TrophiesService } from './trophies.service';
import { TrophiesController } from './trophies.controller';
import TrophiesRepo from './trophies.repo';
import { HasuraService } from '../shared/services/hasura/hasura.service';
import { AuthModule } from '../shared/auth/auth.module';
import { registerTrophiesQueue, TrophiesQueue } from './trophies.queue';

import { TrophiesProcessor } from './trophies.processor';
import { RewardsModule } from '../rewards/rewards.module';
import { TrophiesEventListener } from './trophies.listener';
import { ToolkitModule } from '../toolkits/toolkit.module';

@Module({
  controllers: [TrophiesController],
  imports: [
    AuthModule,
    registerTrophiesQueue,
    forwardRef(() => RewardsModule),
    ToolkitModule,
  ],
  providers: [
    TrophiesService,
    TrophiesRepo,
    HasuraService,
    TrophiesQueue,
    TrophiesProcessor,
    TrophiesEventListener,
  ],
  exports: [TrophiesRepo, TrophiesService, registerTrophiesQueue],
})
export class TrophiesModule {}
