import { i18nValidationMessage } from '@core/modules/i18n-next';
import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsNotEmpty, IsUUID } from 'class-validator';

@InputType()
export class ChannelPostReactionLikeInput {
  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  postId: string;

  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  channelId: string;

  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  reactionId: string;

  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @Field()
  like: boolean;
}
