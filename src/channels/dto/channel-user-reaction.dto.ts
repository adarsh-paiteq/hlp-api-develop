import { InputType, Field, ArgsType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { PaginationArgs } from '@shared/dto/pagination-params.dto';
import { i18nValidationMessage } from '@core/modules/i18n-next';

@InputType()
export class ChannelPostReactionInput {
  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  channel_id: string;

  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  post_id: string;

  @Field()
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  message: string;
}
@ArgsType()
export class PostReactionArgs extends PaginationArgs {
  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  reactionId: string;
}

@ArgsType()
export class UpdateReactionArgs extends PostReactionArgs {
  @Field()
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  message: string;
}

export class PostReactionDto extends ChannelPostReactionInput {
  user_id: string;
}
