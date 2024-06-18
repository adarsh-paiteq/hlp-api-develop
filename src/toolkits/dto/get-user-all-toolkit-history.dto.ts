import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import {
  GetAllToolkitsHistoryArgs,
  GetAllToolkitsHistoryResponse,
} from './get-toolkit-history.dto';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { i18nValidationMessage } from '@core/modules/i18n-next';

@ArgsType()
export class GetUserAllToolkitsHistoryArgs extends GetAllToolkitsHistoryArgs {
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field(() => String)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  user_id: string;
}

@ObjectType()
export class GetUserAllToolkitsHistoryResponse extends GetAllToolkitsHistoryResponse {}
