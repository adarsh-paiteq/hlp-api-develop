import { Module } from '@nestjs/common';
import { ChallengesService } from './challenges.service';
import { ChallengesController } from './challenges.controller';
import { ChallengesRepo } from './challenges.repo';
import { HasuraService } from '../shared/services/hasura/hasura.service';
import { UsersModule } from '../users/users.module';
import { MembershipLevelsModule } from '../membership-levels/membership-levels.module';
import { ChallengesResolver } from './challenges.resolver';
import { AuthModule } from '../shared/auth/auth.module';
import { ChallengesListener } from './challenges.listener';
import { ChallengesProcessor } from './challanges.processor';
import { ChallengesQueue, registerChallengesQueue } from './challenges.queue';
import { UtilsModule } from '../utils/utils.module';
import { ChannelsRepo } from '../channels/channels.repo';

@Module({
  controllers: [ChallengesController],
  providers: [
    ChallengesListener,
    ChallengesService,
    ChallengesRepo,
    HasuraService,
    ChallengesResolver,
    ChallengesQueue,
    ChallengesProcessor,
    ChannelsRepo,
  ],
  imports: [
    registerChallengesQueue,
    AuthModule,
    UsersModule,
    MembershipLevelsModule,
    UtilsModule,
  ],
  exports: [registerChallengesQueue],
})
export class ChallengesModule {}
