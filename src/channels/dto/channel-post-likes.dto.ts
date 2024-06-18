import { Field, ArgsType } from '@nestjs/graphql';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';
import { LikeType } from './channel.dto';
import { i18nValidationMessage } from '@core/modules/i18n-next';

@ArgsType()
export class ChannelPostLikesArgs {
  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  postId: string;

  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  channelId: string;

  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @Field()
  like: boolean;
}

export class UpdateLikesCountDto {
  @IsUUID()
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsEnum(LikeType)
  likeType: string;
}
