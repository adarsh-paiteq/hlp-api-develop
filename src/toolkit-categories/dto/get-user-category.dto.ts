import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { i18nValidationMessage } from '@core/modules/i18n-next';
import {
  GetToolkitCategoryArgs,
  ToolkitCategoryDto,
} from './toolkit_category.dto';

@ArgsType()
export class GetUserToolkitCategoryArgs extends GetToolkitCategoryArgs {
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field(() => String)
  userId: string;
}

@ObjectType()
export class GetUserToolkitCategoryResponse extends ToolkitCategoryDto {}
