import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsNotEmpty, IsUUID } from 'class-validator';
import { i18nValidationMessage } from '@core/modules/i18n-next';
import {
  GetToolkitCategoriesArgs,
  GetToolkitCategoriesResponse,
} from '../toolkit-categories.model';
import { GolaWithUserGoal } from '../../goals/goals.model';

@ArgsType()
export class GetUserToolkitCategoriesArgs extends GetToolkitCategoriesArgs {
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field(() => String)
  userId: string;

  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @Field(() => Boolean, { defaultValue: false })
  showGoals: boolean;
}

@ObjectType()
export class GetUserToolkitCategoriesResponse extends GetToolkitCategoriesResponse {
  @Field(() => [GolaWithUserGoal], { nullable: true })
  goals?: GolaWithUserGoal[];
}
