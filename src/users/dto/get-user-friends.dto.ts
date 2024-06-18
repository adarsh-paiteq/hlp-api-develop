import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field, ObjectType, PickType } from '@nestjs/graphql';
import { PaginationArgs } from '@shared/dto/pagination-params.dto';
import { Users } from '@users/users.model';
import { IsOptional, IsString } from 'class-validator';

@ArgsType()
export class GetFriendsArgs extends PaginationArgs {
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsString({ message: i18nValidationMessage('is_string') })
  @Field(() => String, { nullable: true })
  search?: string;
}

@ObjectType()
export class UserFriendData extends PickType(Users, [
  'id',
  'user_name',
  'first_name',
  'last_name',
  'avatar_image_name',
  'avatar_type',
  'file_path',
]) {}

@ObjectType()
export class GetFriendsResponse {
  @Field(() => Boolean, { defaultValue: false })
  hasMore: boolean;

  @Field(() => [UserFriendData], { nullable: true })
  friends: UserFriendData[];
}
