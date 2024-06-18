import { ChannelUserPost } from '@channels/entities/channel-user-posts.entity';
import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';

@ArgsType()
export class DisableChannelUserPostArgs {
  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  postId: string;
}

@ObjectType()
export class DisableChannelUserPostResponse {
  @Field(() => ChannelUserPost)
  channel_user_post: ChannelUserPost;
}
