import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';

@ArgsType()
export class AddUserGoalsArgs {
  @Field(() => [String], { description: 'Goal ids' })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid'), each: true })
  goals: string[];
}

@ObjectType()
export class AddUserGoalsResponse {
  @Field(() => String)
  message: string;
}
