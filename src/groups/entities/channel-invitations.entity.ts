import {
  Field,
  GraphQLISODateTime,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';

export enum ChannelInvitationStatus {
  ACCEPTED = 'ACCEPTED',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
}
registerEnumType(ChannelInvitationStatus, { name: 'ChannelInvitationStatus' });

@ObjectType()
export class ChannelInvitation {
  id: string;
  channel_id: string;
  user_id: string;
  status: ChannelInvitationStatus;
  @Field(() => GraphQLISODateTime)
  updated_at: Date;
  @Field(() => GraphQLISODateTime)
  created_at: Date;
  doctor_id: string;
}
