import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { BlogPost } from '../../blog-posts/entities/blog-post.entity';
import { MembershipStage } from '../../membership-stages/membership-stages.model';
import { Toolkit } from '../../toolkits/toolkits.model';
import { ToolkitCategory } from '../entities/toolkit_category.entity';
import { ToolkitSubCategory } from '../entities/toolkit_sub_category.entity';
import { MembershipLevel } from '../../membership-levels/entities/membership-level.entity';
import { i18nValidationMessage } from '@core/modules/i18n-next';

@ObjectType()
class ToolkitDto extends Toolkit {
  @Field(() => [BlogPost], { nullable: 'items' })
  blog_posts: BlogPost[];

  membership_levels: MembershipLevel[];

  membership_stages: MembershipStage[];

  @Field(() => MembershipLevel, { nullable: true })
  membership_level: MembershipLevel;

  @Field(() => MembershipStage, { nullable: true })
  membership_stage: MembershipStage;
}

@ObjectType()
export class ToolkitSubCategoryDto extends ToolkitSubCategory {
  @Field(() => [ToolkitDto], { nullable: 'items' })
  tool_kits: ToolkitDto[];
}

@ObjectType()
export class ToolkitCategoryDto extends ToolkitCategory {
  @Field(() => [Toolkit], { nullable: 'items' })
  tool_kits: Toolkit[];

  @Field(() => [ToolkitSubCategoryDto], { nullable: 'items' })
  tool_kit_sub_categories: ToolkitSubCategoryDto[];
}

@ArgsType()
export class GetToolkitCategoryArgs {
  @IsUUID('all', { message: i18nValidationMessage('is_uuid'), each: true })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @Field(() => [String], { nullable: 'itemsAndList' })
  goalIds?: string[];

  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field(() => String)
  id: string;
}
