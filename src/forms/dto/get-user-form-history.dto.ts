import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { GetFormHistoryArgs } from './get-form-history.dto';

@ArgsType()
export class GetUserFormHistoryArgs extends GetFormHistoryArgs {
  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  userId: string;
}
