import { ArgsType, Field, Int, ObjectType, PickType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';
import { i18nValidationMessage } from '@core/modules/i18n-next';
import { Users } from '../../users/users.model';
import { PaginationArgs } from '@shared/dto/pagination-params.dto';

@ArgsType()
export class GetSearchUsersArgs extends PaginationArgs {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @Field(() => String, {
    nullable: true,
  })
  text?: string;
}

@ObjectType()
export class GetUserResponse {
  @Field(() => [UserList], { nullable: true })
  users: UserList[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  totalPage: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;
}

@ObjectType()
export class UserList extends PickType(Users, [
  'id',
  'user_name',
  'first_name',
  'last_name',
  'avatar_image_name',
  'email',
  'date_of_birth',
]) {}
