import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import {
  GetAnswersHistoryArgs,
  GetAnswersHistoryResponse,
} from '@toolkits/toolkits.model';
import { IsNotEmpty, IsString } from 'class-validator';

@ObjectType()
export class GetUserToolkitHistoryResponse extends GetAnswersHistoryResponse {}

@ArgsType()
export class GetUserToolkitHistoryArgs extends GetAnswersHistoryArgs {
  @Field()
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  userId: string;
}
