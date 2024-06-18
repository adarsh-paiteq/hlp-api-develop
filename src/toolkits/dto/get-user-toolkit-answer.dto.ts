import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { i18nValidationMessage } from '@core/modules/i18n-next';
import { GetToolkitAnswerResponse } from './get-toolkit-answer.dto';
import { GetToolkitAnswerArgs } from '@toolkits/toolkits.model';

@ArgsType()
export class GetUserToolkitAnswerArgs extends GetToolkitAnswerArgs {
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field(() => String)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  userId: string;
}

@ObjectType()
export class GetUserToolkitAnswerResponse extends GetToolkitAnswerResponse {}
