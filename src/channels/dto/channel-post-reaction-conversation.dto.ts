import { i18nValidationMessage } from '@core/modules/i18n-next';
import { Field, ArgsType, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

@ArgsType()
export class PostReactionConversationArgs {
  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  conversationId: string;
}

@ArgsType()
export class UpdateReactionConversationArgs extends PostReactionConversationArgs {
  @Field()
  @IsNotEmpty()
  @IsString()
  message: string;
}

@InputType()
export class ChannelPostReactionConversationInput {
  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  post_id: string;

  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  channel_id: string;

  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  reaction_id: string;

  @Field()
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsString({ message: i18nValidationMessage('is_string') })
  message: string;
}

export class ChannelPostReactionConversationDto extends ChannelPostReactionConversationInput {
  user_id: string;
}
