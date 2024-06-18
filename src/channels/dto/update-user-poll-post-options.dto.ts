import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field } from '@nestjs/graphql';
import { IsBoolean, IsNotEmpty, IsUUID } from 'class-validator';

@ArgsType()
export class UpdateUserPollPostOptionArgs {
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field()
  postId: string;

  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field()
  pollOptionId: string;

  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field()
  is_selected: boolean;
}
