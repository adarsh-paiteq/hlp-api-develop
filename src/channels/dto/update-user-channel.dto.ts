import { ArgsType, Field } from '@nestjs/graphql';
import { IsBoolean, IsNotEmpty, IsUUID } from 'class-validator';
import { ChannelUserPost } from '../entities/channel-user-posts.entity';
import { i18nValidationMessage } from '@core/modules/i18n-next';

@ArgsType()
export class UpdateUserChannelArgsDto {
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field()
  channelId: string;

  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @Field()
  follow: boolean;
}

export class ChannelUserPostDto extends ChannelUserPost {
  is_exists: boolean;
}
