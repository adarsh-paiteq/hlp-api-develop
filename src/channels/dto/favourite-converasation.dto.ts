import { i18nValidationMessage } from '@core/modules/i18n-next';
import { InputType, Field } from '@nestjs/graphql';
import { IsBoolean, IsNotEmpty, IsUUID } from 'class-validator';

@InputType()
export class FavouriteConversationInput {
  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  post_id: string;

  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  reaction_id: string;

  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  conversation_id: string;

  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  conversation_creator_id: string;

  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @Field()
  favourite: boolean;
}

export class FavouriteConversationDto {
  post_id: string;
  reaction_id: string;
  conversation_id: string;
  user_id: string;
  conversation_creator_id: string;
}
