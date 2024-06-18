import { ArgsType, Field, Int, ObjectType } from '@nestjs/graphql';
import { UsersData } from './user-channels.dto';
import { PaginationArgs } from '@shared/dto/pagination-params.dto';
import { i18nValidationMessage } from '@core/modules/i18n-next';
import { IsUUID } from 'class-validator';
@ArgsType()
export class GetDoctorChannelUsersListArgs extends PaginationArgs {
  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  channelId: string;

  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  userId: string;
}

@ObjectType()
export class GetDoctorChannelUsersListResponse {
  @Field(() => [UsersData], { nullable: true })
  users: UsersData[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;
}
