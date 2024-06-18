import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { LoggedInUser } from '../shared/auth/jwt.strategy';
import { Roles } from '../shared/decorators/roles.decorator';
import { GetUser } from '../shared/decorators/user.decorator';
import { JwtAuthGuard } from '../shared/guards/auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { UserRoles } from '../users/users.dto';
import {
  GetToolkitCategoryArgs,
  ToolkitCategoryDto,
} from './dto/toolkit_category.dto';
import {
  GetToolkitCategoriesArgs,
  GetToolkitCategoriesResponse,
} from './toolkit-categories.model';
import { ToolkitCategoriesService } from './toolkit-categories.service';
import {
  GetUserToolkitCategoriesArgs,
  GetUserToolkitCategoriesResponse,
} from './dto/get-user-categories.dto';
import { GetUserToolkitCategoryArgs } from './dto/get-user-category.dto';
import { I18nNextLanguage } from '@shared/decorators/language.decorator';
import { GetDoctorToolkitCategoriesResponse } from './dto/get-doctor-categories.dto';
import {
  GetDoctorToolkitCategoryArgs,
  GetDoctorToolkitCategoryResponse,
} from './dto/get-doctor-category.dto';

@Resolver()
export class ToolkitCategoriesResolver {
  constructor(
    private readonly toolkitCategoriesService: ToolkitCategoriesService,
  ) {}

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetToolkitCategoriesResponse)
  async GetToolkitCategories(
    @GetUser() user: LoggedInUser,
    @Args() args: GetToolkitCategoriesArgs,
    @I18nNextLanguage() lang: string,
  ): Promise<GetToolkitCategoriesResponse> {
    return this.toolkitCategoriesService.getCategories(
      user.id,
      args,
      lang,
      user.role,
    );
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => ToolkitCategoryDto, { name: 'getToolkitCategory' })
  async GetToolkitCategory(
    @GetUser() user: LoggedInUser,
    @Args() args: GetToolkitCategoryArgs,
  ): Promise<ToolkitCategoryDto> {
    return this.toolkitCategoriesService.getCategory(
      user.id,
      args.id,
      user.role,
      args.goalIds,
    );
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetUserToolkitCategoriesResponse, {
    name: 'getUserToolkitCategories',
  })
  async getUserToolkitCategories(
    @GetUser() user: LoggedInUser,
    @Args() args: GetUserToolkitCategoriesArgs,
  ): Promise<GetUserToolkitCategoriesResponse> {
    return this.toolkitCategoriesService.getUserCategories(
      args.userId,
      args,
      user.role,
    );
  }

  /**
   *
   * @description
   * Used to list Toolkit categories while adding toolkit to the group in doctor CMS.
   */
  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetDoctorToolkitCategoriesResponse, {
    name: 'getDoctorToolkitCategories',
  })
  async getDoctorToolkitCategories(
    @GetUser() user: LoggedInUser,
  ): Promise<GetDoctorToolkitCategoriesResponse> {
    return this.toolkitCategoriesService.getDoctorCategories(
      user.organization_id,
    );
  }

  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => ToolkitCategoryDto, { name: 'getUserToolkitCategory' })
  async getUserToolkitCategory(
    @GetUser() user: LoggedInUser,
    @Args() args: GetUserToolkitCategoryArgs,
  ): Promise<ToolkitCategoryDto> {
    return this.toolkitCategoriesService.getCategory(
      args.userId,
      args.id,
      user.role,
      args.goalIds,
    );
  }

  /**
   * @description
   * Used to get Toolkit category and subcategores with toolkits
   *  while adding toolkit to the group in doctor CMS.
   */
  @Roles(UserRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetDoctorToolkitCategoryResponse, {
    name: 'getDoctorToolkitCategory',
  })
  async getDoctorToolkitCategory(
    @GetUser() user: LoggedInUser,
    @Args() args: GetDoctorToolkitCategoryArgs,
  ): Promise<GetDoctorToolkitCategoryResponse> {
    return this.toolkitCategoriesService.getDoctorToolkitCategory(
      args.id,
      user.organization_id,
    );
  }
}
