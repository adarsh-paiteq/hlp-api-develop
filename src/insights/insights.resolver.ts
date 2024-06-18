import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { LoggedInUser } from '@shared/auth/jwt.strategy';
import { Roles } from '@shared/decorators/roles.decorator';
import { GetUser } from '@shared/decorators/user.decorator';
import { JwtAuthGuard } from '@shared/guards/auth.guard';
import { RolesGuard } from '@shared/guards/roles.guard';
import { UserRoles } from '../users/users.dto';
import {
  GetActivityInsightsArgsDto,
  GetActivityInsightsResponse,
  GetInsightsResponse,
  GetMoodInsightsArgsDto,
  GetMoodInsightsResponse,
  GetSleepInsightsArgsDto,
  GetSleepInsightsResponse,
} from './dto/insights.dto';
import { InsightsService } from './insights.service';

import {
  GetUserMoodInsightsArgs,
  GetUserMoodInsightsResponse,
} from './dto/get-user-mood-insights.dto';

import {
  GetUserSleepInsightsArgs,
  GetUserSleepInsightsResponse,
} from './dto/get-user-sleep-insights.dto';
import { GetUserInsightsArgs } from './dto/get-user-insights.dto';
import { GetUserActivityInsightsArgs } from './dto/get-user-activity-insights.dto';

@Resolver()
export class InsightsResolver {
  constructor(private readonly insightsService: InsightsService) {}

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetInsightsResponse, { name: 'getInsights' })
  async getInsights(
    @GetUser() user: LoggedInUser,
  ): Promise<GetInsightsResponse> {
    return this.insightsService.getInsights(user.id);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetMoodInsightsResponse, { name: 'getMoodInsights' })
  async getMoodInsights(
    @GetUser() user: LoggedInUser,
    @Args() args: GetMoodInsightsArgsDto,
  ): Promise<GetMoodInsightsResponse> {
    return this.insightsService.getMoodInsights(user.id, args);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetSleepInsightsResponse, { name: 'getSleepInsights' })
  async getSleepInsights(
    @GetUser() user: LoggedInUser,
    @Args() args: GetSleepInsightsArgsDto,
  ): Promise<GetSleepInsightsResponse> {
    return this.insightsService.getSleepInsights(user.id, args);
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetUserSleepInsightsResponse, { name: 'getUserSleepInsights' })
  async getUserSleepInsights(
    @Args() args: GetUserSleepInsightsArgs,
  ): Promise<GetUserSleepInsightsResponse> {
    return await this.insightsService.getSleepInsights(args.userId, args);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetActivityInsightsResponse, { name: 'getActivityInsights' })
  async getActivityInsights(
    @GetUser() user: LoggedInUser,
    @Args() args: GetActivityInsightsArgsDto,
  ): Promise<GetActivityInsightsResponse> {
    return this.insightsService.getActivityInsights(user.id, args);
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetUserMoodInsightsResponse, { name: 'getUserMoodInsights' })
  async getUserMoodInsights(
    @Args() args: GetUserMoodInsightsArgs,
  ): Promise<GetUserMoodInsightsResponse> {
    return await this.insightsService.getMoodInsights(args.userId, args);
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetActivityInsightsResponse, { name: 'getUserActivityInsights' })
  async getUserActivityInsights(
    @Args() args: GetUserActivityInsightsArgs,
  ): Promise<GetActivityInsightsResponse> {
    return this.insightsService.getActivityInsights(args.userId, args);
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetInsightsResponse, { name: 'getUserInsights' })
  async getUserInsights(
    @Args() args: GetUserInsightsArgs,
  ): Promise<GetInsightsResponse> {
    return this.insightsService.getInsights(args.userId);
  }
}
