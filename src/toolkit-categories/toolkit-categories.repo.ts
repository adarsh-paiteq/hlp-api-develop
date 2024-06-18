import { Injectable } from '@nestjs/common';
import { Database } from '../core/modules/database/database.service';
import { UserMembershipLevel } from '../membership-levels/membership-levels.dto';
import { UserMembershipStage } from '../membership-stages/entities/user-membership-stages.entity';
import { Users } from '../users/users.model';
import {
  ToolkitCategoryDto,
  ToolkitSubCategoryDto,
} from './dto/toolkit_category.dto';
import { ToolkitCategoryWithSubCategory } from './toolkit-categories.model';

@Injectable()
export class ToolkitCategoriesRepo {
  constructor(private readonly database: Database) {}

  /**
   *
   * @description get catergories by age_group/organisation_id/goalIds
   */
  async getCategoriesByGoals(
    age_group: string,
    organisation_id: string,
    role: string,
    goalIds?: string[],
  ): Promise<ToolkitCategoryWithSubCategory[]> {
    const validGoals = !!goalIds?.length;
    const params: unknown[] = [age_group, organisation_id, role];

    const query = `
  SELECT
    tool_kit_category.*,
    json_agg(DISTINCT tool_kit_sub_category.*) AS subcategories
  FROM
    tool_kits
    JOIN tool_kit_category ON tool_kits.tool_kit_category = tool_kit_category.id
    JOIN tool_kit_sub_category ON tool_kit_sub_category.tool_kit_category = tool_kit_category.id
    JOIN tool_kit_organisations ON tool_kits.id = tool_kit_organisations.tool_kit_id
    ${
      validGoals
        ? `
      JOIN goals ON tool_kits.goal_id = goals.id
      JOIN organisation_goals ON tool_kits.goal_id = organisation_goals.goal_id
    `
        : ''
    }
  WHERE
    $1 = ANY(tool_kits.access_group)
    AND tool_kit_organisations.organisation_id = $2
    AND tool_kits.status = true
    AND $3 = ANY(tool_kits.access_roles)
    ${
      validGoals
        ? `
      AND tool_kits.goal_id = ANY($4::uuid[]) 
      AND $1 = ANY(goals.age_group)
      AND organisation_goals.organisation_id = $2
    `
        : ''
    }
  GROUP BY
    tool_kit_category.id
  ORDER BY
    tool_kit_category.title;
`;

    if (validGoals) {
      params.push(goalIds);
    }
    const categories =
      await this.database.query<ToolkitCategoryWithSubCategory>(query, params);
    return categories;
  }

  async getUser(userId: string): Promise<Users> {
    const query = `SELECT * FROM users WHERE id=$1`;
    const [user] = await this.database.query<Users>(query, [userId]);
    return user;
  }

  async getToolkitCategoryWithToolkit(
    id: string,
    age_group: string,
    organization_id: string,
    userId: string,
    role: string,
    goalIds?: string[],
  ): Promise<ToolkitCategoryDto> {
    const hasGoalIds = goalIds && goalIds.length;
    const params: unknown[] = [id, age_group, organization_id, userId, role];

    const query = `SELECT
        tool_kit_category.*,
        COALESCE(
          json_agg(tool_kits.*) FILTER (
            WHERE
              tool_kits.id IS NOT NULL
          ),
          '[]'
        ) AS tool_kits
      FROM
        tool_kit_category
        LEFT JOIN LATERAL (
          SELECT
            tool_kits.*
          FROM
            tool_kits
            LEFT JOIN tool_kit_organisations ON tool_kits.id = tool_kit_organisations.tool_kit_id
            LEFT JOIN goals ON tool_kits.goal_id = goals.id
            LEFT JOIN user_goals ON goals.id = user_goals.goal
          WHERE
            tool_kits.tool_kit_category = $1
            AND tool_kit_organisations.organisation_id = $3
            AND tool_kits.status = true
            AND tool_kits.is_whats_new_tool_kit = true
            AND $2 = ANY(tool_kits.access_group)
            AND user_goals.user_id = $4
            AND $5 = ANY(tool_kits.access_roles)
            ${hasGoalIds ? `AND tool_kits.goal_id=ANY($6::uuid[])` : ''}
        ) AS tool_kits ON true
      WHERE
        tool_kit_category.id = $1
      GROUP BY
        tool_kit_category.id;
    `;

    if (hasGoalIds) {
      params.push(goalIds);
    }
    const [toolkitCategory] = await this.database.query<ToolkitCategoryDto>(
      query,
      params,
    );
    return toolkitCategory;
  }

  async getSubCategoriesByCategoryId(
    id: string,
    age_group: string,
    organization_id: string,
    userId: string,
    role: string,
    goalIds?: string[],
  ): Promise<ToolkitSubCategoryDto[]> {
    const hasGoalIds = goalIds && goalIds.length > 0;
    const params: unknown[] = [id, age_group, organization_id, userId, role];
    const query = `SELECT tool_kit_sub_category.*, COALESCE(json_agg(tool_kits.*)
    FILTER (WHERE tool_kits.id IS NOT NULL),'[]') AS tool_kits FROM tool_kit_sub_category
    LEFT JOIN (SELECT tool_kits.*,COALESCE(json_agg(membership_levels.*) FILTER (WHERE membership_levels.id IS NOT NULL ),'[]' ) AS membership_levels,
    COALESCE(json_agg(membership_stages.*) FILTER (WHERE membership_stages.id IS NOT NULL ),'[]') AS membership_stages,COALESCE(json_agg(blog_posts.*) FILTER (WHERE blog_posts.id IS NOT NULL ),'[]') AS blog_posts FROM tool_kits
          LEFT JOIN blog_posts ON blog_posts.tool_kit=tool_kits.id
          LEFT JOIN membership_stages ON membership_stages.id=tool_kits.membership_stage_id
          LEFT JOIN membership_levels ON membership_levels.id=tool_kits.membership_level_id
          LEFT JOIN tool_kit_organisations ON tool_kits.id = tool_kit_organisations.tool_kit_id
          LEFT JOIN goals ON tool_kits.goal_id = goals.id
          LEFT JOIN user_goals ON goals.id = user_goals.goal
          WHERE tool_kits.status=true AND $2 = ANY(tool_kits.access_group) AND tool_kit_organisations.organisation_id = $3 AND user_goals.user_id = $4 AND $5 = ANY(tool_kits.access_roles)
           ${
             goalIds && goalIds.length
               ? `AND tool_kits.goal_id=ANY($6::uuid[])`
               : ''
           } GROUP BY tool_kits.id ) AS tool_kits ON tool_kits.tool_kit_sub_category=tool_kit_sub_category.id
    WHERE tool_kit_sub_category.tool_kit_category=$1
    GROUP BY tool_kit_sub_category.id ORDER BY tool_kit_sub_category.ranking ASC`;

    if (hasGoalIds) {
      params.push(goalIds);
    }
    const subCategories = await this.database.query<ToolkitSubCategoryDto>(
      query,
      params,
    );
    return subCategories;
  }

  async getUserMembershipLevels(
    userId: string,
  ): Promise<UserMembershipLevel[]> {
    const query = `SELECT * FROM user_membership_levels WHERE user_id=$1`;
    const membershipLevels = await this.database.query<UserMembershipLevel>(
      query,
      [userId],
    );
    return membershipLevels;
  }

  async getUserMembershipStages(
    userId: string,
  ): Promise<UserMembershipStage[]> {
    const query = `SELECT * FROM user_membership_stages WHERE user_id='${userId}'
    `;
    const userMembershipStages = await this.database.query<UserMembershipStage>(
      query,
    );
    return userMembershipStages;
  }

  /**
   *
   * @description get catergories by organisation_id
   */
  async getToolkitCategoriesByOrganisation(
    organisationId: string,
  ): Promise<ToolkitCategoryWithSubCategory[]> {
    const query = `
    SELECT
      tool_kit_category.*,
      json_agg(DISTINCT tool_kit_sub_category.*) AS subcategories
    FROM
      tool_kits
      JOIN tool_kit_category ON tool_kits.tool_kit_category = tool_kit_category.id
      JOIN tool_kit_sub_category ON tool_kit_sub_category.tool_kit_category = tool_kit_category.id
      JOIN tool_kit_organisations ON tool_kits.id = tool_kit_organisations.tool_kit_id
    WHERE
       tool_kit_organisations.organisation_id = $1 AND tool_kits.status = $2
    GROUP BY
      tool_kit_category.id
    ORDER BY
      tool_kit_category.title;
  `;
    const categories =
      await this.database.query<ToolkitCategoryWithSubCategory>(query, [
        organisationId,
        true,
      ]);
    return categories;
  }

  async getToolkitCategoryWithToolkitByOrganisation(
    id: string,
    organisationId: string,
  ): Promise<ToolkitCategoryDto> {
    const query = `SELECT
    tool_kit_category.*,
    COALESCE(
      json_agg(tool_kits.*) FILTER (
        WHERE
          tool_kits.id IS NOT NULL
      ),
      '[]'
    ) AS tool_kits
  FROM
    tool_kit_category
    LEFT JOIN LATERAL (
      SELECT
        tool_kits.*
      FROM
        tool_kits
        LEFT JOIN tool_kit_organisations ON tool_kits.id = tool_kit_organisations.tool_kit_id
      WHERE
        tool_kits.tool_kit_category = $1
        AND tool_kit_organisations.organisation_id = $2
        AND tool_kits.status = true
        AND tool_kits.is_whats_new_tool_kit = true
    ) AS tool_kits ON true
  WHERE
    tool_kit_category.id = $1
  GROUP BY
    tool_kit_category.id;
`;

    const [toolkitCategory] = await this.database.query<ToolkitCategoryDto>(
      query,
      [id, organisationId],
    );
    return toolkitCategory;
  }

  async getSubCategoriesByCategoryAndOrganisation(
    id: string,
    organisationId: string,
  ): Promise<ToolkitSubCategoryDto[]> {
    const query = `SELECT tool_kit_sub_category.*, COALESCE(json_agg(tool_kits.*)
    FILTER (WHERE tool_kits.id IS NOT NULL),'[]') AS tool_kits FROM tool_kit_sub_category
    LEFT JOIN (SELECT tool_kits.*,COALESCE(json_agg(membership_levels.*) FILTER (WHERE membership_levels.id IS NOT NULL ),'[]' ) AS membership_levels,
    COALESCE(json_agg(membership_stages.*) FILTER (WHERE membership_stages.id IS NOT NULL ),'[]') AS membership_stages,COALESCE(json_agg(blog_posts.*) FILTER (WHERE blog_posts.id IS NOT NULL ),'[]') AS blog_posts FROM tool_kits
          LEFT JOIN blog_posts ON blog_posts.tool_kit=tool_kits.id
          LEFT JOIN membership_stages ON membership_stages.id=tool_kits.membership_stage_id
          LEFT JOIN membership_levels ON membership_levels.id=tool_kits.membership_level_id
          LEFT JOIN tool_kit_organisations ON tool_kits.id = tool_kit_organisations.tool_kit_id
          WHERE tool_kits.status=true AND tool_kit_organisations.organisation_id = $2
          GROUP BY tool_kits.id ) AS tool_kits ON tool_kits.tool_kit_sub_category=tool_kit_sub_category.id
    WHERE tool_kit_sub_category.tool_kit_category= $1
    GROUP BY tool_kit_sub_category.id ORDER BY tool_kit_sub_category.ranking ASC`;

    const subCategories = await this.database.query<ToolkitSubCategoryDto>(
      query,
      [id, organisationId],
    );
    return subCategories;
  }
}
