import { ArgsType, Field, Int, ObjectType } from '@nestjs/graphql';
import { PaginationArgs } from '@shared/dto/pagination-params.dto';
import { UserNotifications } from './get-notifications.dto';

@ArgsType()
export class DoctorNotificationArgs extends PaginationArgs {}

@ObjectType()
export class GetDoctorNotificationResponse {
  @Field(() => [UserNotifications], { nullable: 'items' })
  notificationList: UserNotifications[];

  @Field(() => Int)
  notificationCount: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;
}
