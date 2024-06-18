import { Module } from '@nestjs/common';
import { MembershipLevelsService } from './membership-levels.service';
import { MembershipLevelsController } from './membership-levels.controller';
import { MembershipLevelsRepo } from './membership-levels.repo';
import {
  MembershipLevelsQueue,
  registerMembershipLevelsQueue,
} from './membership-levels.queue';
import { MembershipLevelsProcessor } from './membership-levels.processor';
import { MembershipLevelsListener } from './membership-levels.listener';
import { HasuraService } from '../shared/services/hasura/hasura.service';

@Module({
  controllers: [MembershipLevelsController],
  providers: [
    MembershipLevelsService,
    MembershipLevelsRepo,
    MembershipLevelsQueue,
    MembershipLevelsProcessor,
    MembershipLevelsListener,
    HasuraService,
  ],
  imports: [registerMembershipLevelsQueue],
  exports: [
    registerMembershipLevelsQueue,
    MembershipLevelsRepo,
    MembershipLevelsService,
  ],
})
export class MembershipLevelsModule {}
