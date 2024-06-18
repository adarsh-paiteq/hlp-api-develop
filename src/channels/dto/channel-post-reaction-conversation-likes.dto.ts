import { i18nValidationMessage } from '@core/modules/i18n-next';
import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsNotEmpty, IsUUID } from 'class-validator';

@InputType()
export class ChannelPostReactionConversationLikeInput {
  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  post_id: string;

  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  channel_id: string;

  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  reaction_id: string;

  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  conversation_id: string;

  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @Field()
  like: boolean;
}
export class ChannelPostReactionConversationLikeDto {
  user_id: string;
  post_id: string;
  reaction_id: string;
  channel_id: string;
  conversation_id: string;
}
