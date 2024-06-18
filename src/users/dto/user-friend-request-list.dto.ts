import { Field, ObjectType, Int } from '@nestjs/graphql';
import { UserFriendRequest } from '@users/entities/user-friend-request.entity';
import { Users } from '@users/users.model';
@ObjectType()
export class FriendRequestsWithUser extends UserFriendRequest {
  @Field(() => Users, { nullable: true })
  user: Users;
}

@ObjectType()
export class GetUserFriendRequestsResponse {
  @Field(() => Boolean, {
    defaultValue: false,
    description: 'If more friendRequest after this set',
  })
  hasMore: boolean;

  @Field(() => Int)
  friendRequestCount: number;

  @Field(() => [FriendRequestsWithUser], { nullable: 'items' })
  userFriendRequests: FriendRequestsWithUser[];
}
