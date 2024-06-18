import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { LoggedInUser } from '@shared/auth/jwt.strategy';
import { Roles } from '@shared/decorators/roles.decorator';
import { GetUser } from '@shared/decorators/user.decorator';
import { JwtAuthGuard } from '@shared/guards/auth.guard';
import { RolesGuard } from '@shared/guards/roles.guard';
import { UserRoles } from '@users/users.dto';
import {
  GetGoalLevelsArgs,
  GetGoalLevelsResponse,
} from './dto/goal-levels.dto';
import { GoalInfo } from './entities/goal-info.entity';
import {
  GetGoalsByAgeGroupResponse,
  UpdateUserGoalsArgs,
  UpdateUserGoalsResponse,
} from './goals.model';
import { GoalsService } from './goals.service';
import {
  GetGoalHistoryArgs,
  GetGoalHistoryResponse,
} from './dto/get-goal-history.dto';
import {
  AddUserGoalsArgs,
  AddUserGoalsResponse,
} from './dto/add-user-goals.dto';
import { I18nNextLanguage } from '@shared/decorators/language.decorator';
import {
  GetUserGoalLevelsArgs,
  GetUserGoalLevelsResponse,
} from './dto/get-goal-level.dto';
import {
  GetUserGoalHistoryArgs,
  GetUserGoalHistoryResponse,
} from './dto/get-user-goal-history.dto';
import { GetGoalCategoriesWithGoalsResponse } from './dto/get-goal-categories-with-goals.dto';

@Resolver()
export class GoalsResolver {
  constructor(private readonly goalsService: GoalsService) {}

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => UpdateUserGoalsResponse)
  async updateUserGoals(
    @GetUser() user: LoggedInUser,
    @Args() args: UpdateUserGoalsArgs,
  ): Promise<UpdateUserGoalsResponse> {
    return this.goalsService.updateUserGoals(user, args);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetGoalsByAgeGroupResponse)
  async getGoalsByAgeGroup(
    @GetUser() user: LoggedInUser,
  ): Promise<GetGoalsByAgeGroupResponse> {
    const { id, organization_id } = user;
    return this.goalsService.getGoalsByAgeGroup(id, organization_id);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetGoalLevelsResponse, { name: 'getUserGoalLevels' })
  async getGoalLevels(
    @GetUser() user: LoggedInUser,
    @Args() args: GetGoalLevelsArgs,
    @I18nNextLanguage() lang: string,
  ): Promise<GetGoalLevelsResponse> {
    return this.goalsService.getGoalLevels(user.id, args.limit, lang);
  }
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GoalInfo, { name: 'getGoalInfo' })
  async getGoalInfo(@I18nNextLanguage() lang: string): Promise<GoalInfo> {
    return this.goalsService.getGoalInfo(lang);
  }

  @Query(() => GetGoalHistoryResponse, { name: 'getUserGoalHistory' })
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getUserGoalHistory(
    @GetUser() user: LoggedInUser,
    @Args() args: GetGoalHistoryArgs,
  ): Promise<GetGoalHistoryResponse> {
    return this.goalsService.getUserGoalHistory(user.id, args);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => AddUserGoalsResponse, { name: 'addUserGoals' })
  async addUserGoals(
    @GetUser() user: LoggedInUser,
    @Args() args: AddUserGoalsArgs,
  ): Promise<AddUserGoalsResponse> {
    return this.goalsService.addUserGoals(user.id, args.goals);
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetUserGoalLevelsResponse, { name: 'getUserGoalLevel' })
  async getGoalLevel(
    @Args() args: GetUserGoalLevelsArgs,
    @I18nNextLanguage() lang: string,
  ): Promise<GetUserGoalLevelsResponse> {
    return this.goalsService.getGoalLevels(args.userId, args.limit, lang);
  }

  @Query(() => GetUserGoalHistoryResponse, { name: 'getGoalHistory' })
  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getGoalHistory(
    @Args() args: GetUserGoalHistoryArgs,
  ): Promise<GetUserGoalHistoryResponse> {
    return await this.goalsService.getGoalHistory(args.userId, args);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetGoalCategoriesWithGoalsResponse, {
    name: 'getGoalCategoriesWithGoals',
  })
  async getOrganisationGoals(
    @GetUser() user: LoggedInUser,
    @I18nNextLanguage() lang: string,
  ): Promise<GetGoalCategoriesWithGoalsResponse> {
    const { id, organization_id } = user;
    return this.goalsService.getGoalCategoriesWithGoals(
      id,
      organization_id,
      lang,
    );
  }
}
