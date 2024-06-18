import { forwardRef, Module } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { ChannelsController } from './channels.controller';
import { HasuraService } from '../shared/services/hasura/hasura.service';
import { ChannelsQueue, registerChannelsQueue } from './channels.queue';
import { ChannelsProcessor } from './channels.processor';
import { ChannelsRepo } from './channels.repo';
import { RewardsModule } from '../rewards/rewards.module';
import { ChannelsListener } from './channels.listener';
import { ChannelsResolver } from './channels.resolver';
import { AuthModule } from '../shared/auth/auth.module';

@Module({
  controllers: [ChannelsController],
  providers: [
    ChannelsService,
    HasuraService,
    ChannelsQueue,
    ChannelsProcessor,
    ChannelsRepo,
    ChannelsListener,
    ChannelsResolver,
  ],
  imports: [AuthModule, registerChannelsQueue, forwardRef(() => RewardsModule)],
  exports: [registerChannelsQueue, ChannelsService, ChannelsRepo],
})
export class ChannelsModule {}
