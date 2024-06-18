import { UserChannel } from '@channels/entities/user-channel.entity';
import { ChannelInvitation } from './entities/channel-invitations.entity';
import { Group } from './entities/groups.entity';

export enum GroupsEvent {
  GROUP_INVITATION_CREATED = '[GROUPS] GROUP INVITATION CREATED',
  GROUP_DELETED = '[GROUPS] GROUP_DELETED',
  GROUP_CREATED = '[GROUPS] GROUP CREATED',
  GROUP_MEMBER_ADDED = '[GROUPS] GROUP_MEMBER_ADDED',
  GROUP_OWNER_ADDED = '[GROUPS] GROUP_OWNER_ADDED',
}

export class groupInvitationCreatedEvent {
  constructor(public channelInvitation: ChannelInvitation) {}
}

export class GroupCreatedEvent {
  constructor(public group: Group) {}
}
export class GroupDeletedEvent extends GroupCreatedEvent {}

export class GroupMemberAddedEvent {
  constructor(public userChannel: UserChannel) {}
}

export class GroupOwnerAddedEvent {
  constructor(public userChannel: UserChannel) {}
}
