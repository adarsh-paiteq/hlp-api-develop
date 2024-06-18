import { Module } from '@nestjs/common';
import { CommunityService } from './community.service';
import { CommunityController } from './community.controller';
import { HasuraService } from '../shared/services/hasura/hasura.service';
import { CommunityRepo } from './community.repo';

@Module({
  controllers: [CommunityController],
  providers: [CommunityService, CommunityRepo, HasuraService],
  exports: [CommunityRepo],
})
export class CommunityModule {}
