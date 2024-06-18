import { Injectable, NotFoundException } from '@nestjs/common';
import { ToolkitCategoryDto } from './dto/toolkit_category.dto';
import {
  GetToolkitCategoriesArgs,
  GetToolkitCategoriesResponse,
  ToolkitCategoryWithSubCategory,
} from './toolkit-categories.model';
import { ToolkitCategoriesRepo } from './toolkit-categories.repo';
import { GoalsRepo } from '../goals/goals.repo';
import {
  GetUserToolkitCategoriesArgs,
  GetUserToolkitCategoriesResponse,
} from './dto/get-user-categories.dto';
import { Users } from '../users/users.model';
import { GolaWithUserGoal } from '../goals/goals.model';
import { TranslationService } from '@shared/services/translation/translation.service';
import { ToolkitSubCategory } from './entities/toolkit_sub_category.entity';
import { GetDoctorToolkitCategoriesResponse } from './dto/get-doctor-categories.dto';

@Injectable()
export class ToolkitCategoriesService {
  constructor(
    private readonly toolkitCategoriesRepo: ToolkitCategoriesRepo,
    private readonly goalsRepo: GoalsRepo,
    private readonly translationService: TranslationService,
  ) {}

  async validateUserOrganisation(userId: string): Promise<Users> {
    const user = await this.toolkitCategoriesRepo.getUser(userId);
    if (!user) {
      throw new NotFoundException(`toolkit-categories.user_not_found`);
    }

    const { age_group, organization_id } = user;
    if (!organization_id && !age_group) {
      throw new NotFoundException(`toolkit-categories.organisation_not_found`);
    }

    return user;
  }

  async getCategories(
    userId: string,
    args: GetToolkitCategoriesArgs,
    lang: string,
    role: string,
  ): Promise<GetToolkitCategoriesResponse> {
    const user = await this.validateUserOrganisation(userId);
    const { age_group, organization_id } = user;
    const categories = await this.toolkitCategoriesRepo.getCategoriesByGoals(
      age_group,
      organization_id,
      role,
      args.goalIds,
    );
    const translatedCategories =
      this.translationService.getTranslations<ToolkitCategoryWithSubCategory>(
        categories,
        ['title', 'description'],
        lang,
      );
    const translatedSubcategories = translatedCategories.map((category) => ({
      ...category,
      subcategories:
        this.translationService.getTranslations<ToolkitSubCategory>(
          category.subcategories,
          ['title', 'description'],
          lang,
        ),
    }));
    return {
      toolkitCategories: translatedSubcategories,
    };
  }

  /**@description used in doctors cms will return goals and categories */
  async getUserCategories(
    userId: string,
    args: GetUserToolkitCategoriesArgs,
    role: string,
  ): Promise<GetUserToolkitCategoriesResponse> {
    const user = await this.validateUserOrganisation(userId);
    const { age_group, organization_id } = user;

    const batchRequests: [
      Promise<ToolkitCategoryWithSubCategory[]>,
      Promise<GolaWithUserGoal[]>?,
    ] = [
      this.toolkitCategoriesRepo.getCategoriesByGoals(
        age_group,
        organization_id,
        role,
        args.goalIds,
      ),
    ];
    if (args.showGoals) {
      const goalsPromise = this.goalsRepo.getGoalsByAgeGroup(
        userId,
        age_group,
        organization_id,
      );
      batchRequests.push(goalsPromise);
    }
    const [categories, goals] = await Promise.all(batchRequests);

    return {
      toolkitCategories: categories,
      goals: goals,
    };
  }

  /**@description used in doctors cms to get goals and categories for doctor */
  async getDoctorCategories(
    organizationId?: string,
  ): Promise<GetDoctorToolkitCategoriesResponse> {
    if (!organizationId) {
      throw new NotFoundException(`toolkit-categories.organisation_not_found`);
    }

    const categories =
      await this.toolkitCategoriesRepo.getToolkitCategoriesByOrganisation(
        organizationId,
      );

    return {
      toolkitCategories: categories,
    };
  }

  async getCategory(
    userId: string,
    id: string,
    role: string,
    goalIds?: string[],
  ): Promise<ToolkitCategoryDto> {
    const user = await this.toolkitCategoriesRepo.getUser(userId);
    if (!user) {
      throw new NotFoundException(`toolkit-categories.user_not_found`);
    }
    const { age_group, organization_id } = user;
    if (!organization_id) {
      throw new NotFoundException(`toolkit-categories.organisation_not_found`);
    }

    const [userMembershipLevels, UserMembershipStages] = await Promise.all([
      this.toolkitCategoriesRepo.getUserMembershipLevels(userId),
      this.toolkitCategoriesRepo.getUserMembershipStages(userId),
    ]);
    const userMembershipStgeIds = UserMembershipStages.map(
      (stage) => stage.membership_stage_id,
    );
    const userMembershipLevelIds = userMembershipLevels.map(
      (level) => level.membership_level_id,
    );
    const toolkitCategory =
      await this.toolkitCategoriesRepo.getToolkitCategoryWithToolkit(
        id,
        age_group,
        organization_id,
        userId,
        role,
        goalIds,
      );
    if (!toolkitCategory) {
      throw new NotFoundException(`toolkit-categories.category_not_found`);
    }
    const subCategories =
      await this.toolkitCategoriesRepo.getSubCategoriesByCategoryId(
        id,
        age_group,
        organization_id,
        userId,
        role,
        goalIds,
      );
    const mappedSubCategories = subCategories.filter((subcategory) => {
      const toolkits = subcategory.tool_kits.filter((toolkit) => {
        if (toolkit.membership_level_id && toolkit.membership_stage_id) {
          const hasLevel = userMembershipLevelIds.includes(
            toolkit.membership_level_id,
          );
          const hasStage = userMembershipStgeIds.includes(
            toolkit.membership_stage_id,
          );
          return hasStage && hasLevel;
        }

        if (toolkit.membership_level_id) {
          return userMembershipLevelIds.includes(toolkit.membership_level_id);
        }
        if (toolkit.membership_stage_id) {
          return userMembershipStgeIds.includes(toolkit.membership_stage_id);
        }
        return true;
      });
      const mappedToolkits = toolkits.map((toolkit) => {
        const mappedToolkit = {
          ...toolkit,
        };
        if (toolkit.membership_stages.length) {
          const [membershipStage] = toolkit.membership_stages;
          mappedToolkit.membership_stage = membershipStage;
        }
        if (toolkit.membership_levels.length) {
          const [membershipLevel] = toolkit.membership_levels;
          mappedToolkit.membership_level = membershipLevel;
        }
        return mappedToolkit;
      });

      // exclude the subcategory if no toolkits
      if (!mappedToolkits.length) {
        return false;
      }

      return {
        ...subcategory,
        tool_kits: mappedToolkits,
      };
    });
    return {
      ...toolkitCategory,
      tool_kit_sub_categories: mappedSubCategories,
    };
  }

  async getDoctorToolkitCategory(
    id: string,
    organisationId?: string,
  ): Promise<ToolkitCategoryDto> {
    if (!organisationId) {
      throw new NotFoundException(`toolkit-categories.organisation_not_found`);
    }

    const [toolkitCategory, subCategories] = await Promise.all([
      this.toolkitCategoriesRepo.getToolkitCategoryWithToolkitByOrganisation(
        id,
        organisationId,
      ),
      this.toolkitCategoriesRepo.getSubCategoriesByCategoryAndOrganisation(
        id,
        organisationId,
      ),
    ]);
    if (!toolkitCategory) {
      throw new NotFoundException(`toolkit-categories.category_not_found`);
    }
    const mappedSubCategories = subCategories.filter((subcategory) => {
      const mappedToolkits = subcategory.tool_kits.map((toolkit) => {
        const mappedToolkit = {
          ...toolkit,
        };
        if (toolkit.membership_stages.length) {
          const [membershipStage] = toolkit.membership_stages;
          mappedToolkit.membership_stage = membershipStage;
        }
        if (toolkit.membership_levels.length) {
          const [membershipLevel] = toolkit.membership_levels;
          mappedToolkit.membership_level = membershipLevel;
        }
        return mappedToolkit;
      });
      // exclude the subcategory if no toolkits
      if (!mappedToolkits.length) {
        return false;
      }
      return {
        ...subcategory,
        tool_kits: mappedToolkits,
      };
    });
    return {
      ...toolkitCategory,
      tool_kit_sub_categories: mappedSubCategories,
    };
  }
}
