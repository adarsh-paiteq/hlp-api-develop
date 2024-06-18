import { Field, ArgsType, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsNotEmpty, IsUUID } from 'class-validator';
import { GetChannelPostsResponse } from './get-channel-posts.dto';
import { i18nValidationMessage } from '@core/modules/i18n-next';

@ArgsType()
export class UpdateFavouritePostDto {
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field()
  postId: string;

  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field()
  postCreatorId: string;

  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @Field()
  favourite: boolean;
}
@ObjectType()
export class GetFavouritePostsResponse extends GetChannelPostsResponse {}
