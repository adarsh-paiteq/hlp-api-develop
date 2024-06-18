import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { GetGoalLevelsArgs, GetGoalLevelsResponse } from './goal-levels.dto';

@ArgsType()
export class GetUserGoalLevelsArgs extends GetGoalLevelsArgs {
  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  userId: string;
}

@ObjectType()
export class GetUserGoalLevelsResponse extends GetGoalLevelsResponse {}
