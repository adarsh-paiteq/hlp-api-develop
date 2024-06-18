import { Module } from '@nestjs/common';
import { ToolkitService } from './toolkit.service';
import { ToolkitController } from './toolkit.controller';
import { HasuraService } from './../shared/services/hasura/hasura.service';
import { ToolkitRepo } from './toolkit.repo';
import { ToolkitsResolver } from './toolkits.resolver';
import { AuthModule } from '../shared/auth/auth.module';
import { GoalsModule } from '../goals/goals.module';
import { UtilsModule } from '../utils/utils.module';

@Module({
  imports: [AuthModule, GoalsModule, UtilsModule],
  controllers: [ToolkitController],
  providers: [ToolkitService, HasuraService, ToolkitRepo, ToolkitsResolver],
  exports: [ToolkitService, ToolkitRepo],
})
export class ToolkitModule {}
