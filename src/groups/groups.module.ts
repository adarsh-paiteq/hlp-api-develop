import { Module } from '@nestjs/common';
import { AuthModule } from '@shared/auth/auth.module';
import { GroupsService } from './groups.service';
import { GroupsRepo } from './groups.repo';
import { GroupsResolver } from './groups.resolver';

@Module({
  imports: [AuthModule],
  providers: [GroupsResolver, GroupsService, GroupsRepo],
})
export class GroupsModule {}
