import { forwardRef, Module } from '@nestjs/common';
import { MembershipStagesService } from './membership-stages.service';
import { MembershipStagesController } from './membership-stages.controller';
import { MembershipStagesListener } from './membership-stages.listener';
import { MembershipStagesRepo } from './membership-stages.repo';
import {
  MembershipStagesQueue,
  registerMembershipStagesQueue,
} from './membership-stages.queue';
import { MembershipStagesProcessor } from './membership-stages.processor';
import { HasuraService } from '../shared/services/hasura/hasura.service';
import { UsersModule } from '../users/users.module';

@Module({
  controllers: [MembershipStagesController],
  providers: [
    MembershipStagesService,
    MembershipStagesListener,
    MembershipStagesRepo,
    MembershipStagesQueue,
    MembershipStagesProcessor,
    HasuraService,
  ],
  imports: [registerMembershipStagesQueue, forwardRef(() => UsersModule)],
  exports: [
    registerMembershipStagesQueue,
    MembershipStagesRepo,
    MembershipStagesService,
  ],
})
export class MembershipStagesModule {}
