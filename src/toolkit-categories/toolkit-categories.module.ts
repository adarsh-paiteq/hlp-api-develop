import { Module } from '@nestjs/common';
import { ToolkitCategoriesService } from './toolkit-categories.service';
import { ToolkitCategoriesResolver } from './toolkit-categories.resolver';
import { ToolkitCategoriesRepo } from './toolkit-categories.repo';
import { AuthModule } from '../shared/auth/auth.module';
import { GoalsModule } from '../goals/goals.module';

@Module({
  providers: [
    ToolkitCategoriesResolver,
    ToolkitCategoriesService,
    ToolkitCategoriesRepo,
  ],
  imports: [AuthModule, GoalsModule],
})
export class ToolkitCategoriesModule {}
