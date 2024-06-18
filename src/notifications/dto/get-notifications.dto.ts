import { Field, ObjectType, Int } from '@nestjs/graphql';
import { UserNotification } from '../entities/user-notifications.entity';
import { Users } from '../../users/users.model';

@ObjectType()
export class UserNotifications extends UserNotification {
  @Field(() => Users, { nullable: true })
  account: Users;
}

@ObjectType()
export class GetUserNotificationResponse {
  @Field(() => Boolean, {
    defaultValue: false,
    description: 'If more notification after this set',
  })
  hasMore: boolean;

  @Field(() => Int)
  notificationCount: number;

  @Field(() => [UserNotifications], { nullable: 'items' })
  notificationList: UserNotifications[];
}
