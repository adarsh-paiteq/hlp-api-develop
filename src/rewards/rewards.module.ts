import { forwardRef, Module } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { RewardsController } from './rewards.controller';
import { HasuraService } from '../shared/services/hasura/hasura.service';
import { RewardsRepo } from './rewards.repo';
import { registerRewardsQueue, RewardsQueue } from './rewards.queue';
import { RewardsProcessor } from './rewards.processor';
import { RewardsEventListener } from './rewards.listener';
import { MembershipStagesModule } from '../membership-stages/membership-stages.module';
import { MembershipLevelsModule } from '../membership-levels/membership-levels.module';
import { GoalsModule } from '../goals/goals.module';
import { ChannelsModule } from '../channels/channels.module';
import { TrophiesModule } from '../trophies/trophies.module';
import { UsersModule } from '../users/users.module';
import { RewardsResolver } from './rewards.resolver';
import { AuthModule } from '@shared/auth/auth.module';
import { FormsModule } from '../forms/forms.module';

@Module({
  controllers: [RewardsController],
  providers: [
    RewardsService,
    HasuraService,
    RewardsRepo,
    RewardsQueue,
    RewardsProcessor,
    RewardsEventListener,
    RewardsResolver,
  ],
  imports: [
    registerRewardsQueue,
    MembershipStagesModule,
    MembershipLevelsModule,
    GoalsModule,
    AuthModule,
    FormsModule,
    forwardRef(() => ChannelsModule),
    forwardRef(() => TrophiesModule),
    forwardRef(() => UsersModule),
  ],
  exports: [registerRewardsQueue, RewardsService, RewardsRepo],
})
export class RewardsModule {}
