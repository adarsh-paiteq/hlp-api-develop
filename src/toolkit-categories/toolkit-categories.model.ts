import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsArray, IsOptional, IsUUID } from 'class-validator';
import { ToolkitCategory } from './entities/toolkit_category.entity';
import { ToolkitSubCategory } from './entities/toolkit_sub_category.entity';
import { i18nValidationMessage } from '@core/modules/i18n-next';

@ObjectType()
export class ToolkitCategoryWithSubCategory extends ToolkitCategory {
  subcategories: ToolkitSubCategory[];
}

@ArgsType()
export class GetToolkitCategoriesArgs {
  @Field(() => [String], { nullable: 'itemsAndList' })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid'), each: true })
  @IsArray()
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  goalIds?: string[];
}

@ObjectType()
export class GetToolkitCategoriesResponse {
  @Field(() => [ToolkitCategoryWithSubCategory], { nullable: 'items' })
  toolkitCategories: ToolkitCategoryWithSubCategory[];
}
