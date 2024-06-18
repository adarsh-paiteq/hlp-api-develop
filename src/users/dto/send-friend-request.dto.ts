import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { i18nValidationMessage } from '@core/modules/i18n-next';
import { UserFriendRequest } from '@users/entities/user-friend-request.entity';

@ArgsType()
export class SendUserFriendRequestArgs {
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field()
  friendId: string;
}

@ObjectType()
export class SendUserFriendRequestResponse {
  @Field(() => String)
  message: string;

  @Field(() => UserFriendRequest)
  user_friend_request: UserFriendRequest;
}

export class InsertUserFriendRequest {
  receiver_id: string;
  sender_id: string;
}
