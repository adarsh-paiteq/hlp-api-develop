import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ToolkitCategoryDto } from './toolkit_category.dto';

@ArgsType()
export class GetDoctorToolkitCategoryArgs {
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field(() => String)
  id: string;
}

@ObjectType()
export class GetDoctorToolkitCategoryResponse extends ToolkitCategoryDto {}
