import { ChannelInvitationStatus } from '@groups/entities/channel-invitations.entity';
import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserFriendRequest {
  is_deleted: boolean;
  status: ChannelInvitationStatus;
  @Field(() => GraphQLISODateTime)
  updated_at: Date;
  @Field(() => GraphQLISODateTime)
  created_at: Date;
  id: string;
  receiver_id: string;
  sender_id: string;
}
