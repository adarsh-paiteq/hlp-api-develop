import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field, ObjectType, PickType } from '@nestjs/graphql';
import { PaginationArgs } from '@shared/dto/pagination-params.dto';
import { Users } from '@users/users.model';
import { IsBoolean, IsNotEmpty, IsUUID } from 'class-validator';

@ArgsType()
export class UserChannelArgs {
  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  channelId: string;
}
@ArgsType()
export class UserFollowChannelArgs extends UserChannelArgs {}
@ArgsType()
export class UserFollowChannelStatusArgs {
  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  id: string;

  @Field(() => Boolean)
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  is_channel_unfollowed: boolean;
}

@ArgsType()
export class ChannelUserListArgs extends PaginationArgs {
  @Field()
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  channelId: string;
}

@ObjectType()
export class UsersData extends PickType(Users, [
  'id',
  'user_name',
  'avatar',
  'avatar_image_name',
  'full_name',
  'first_name',
  'last_name',
  'image_url',
  'image_id',
  'file_path',
]) {}
@ObjectType()
export class GetChannelUserListResponse {
  @Field(() => [UsersData], { nullable: true })
  users: UsersData[];

  @Field(() => Boolean, { defaultValue: false })
  hasMore: boolean;
}
