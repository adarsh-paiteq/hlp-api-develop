import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { i18nValidationMessage } from '@core/modules/i18n-next';
import { UserFriendRequest } from '@users/entities/user-friend-request.entity';

@ArgsType()
export class ResendUserFriendRequestArgs {
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field()
  requestId: string;
}

@ObjectType()
export class ResendUserFriendRequestResponse {
  @Field(() => String)
  message: string;

  @Field(() => UserFriendRequest)
  user_friend_request: UserFriendRequest;
}
