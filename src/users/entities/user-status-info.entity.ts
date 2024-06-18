import {
  Field,
  GraphQLISODateTime,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';

export enum UserStatus {
  ONLINE = 'ONLINE',
  BUSY = 'BUSY',
  ABSENT = 'ABSENT',
  OFFLINE = 'OFFLINE',
}

export enum UserStatusChangedBy {
  SERVER = 'SERVER',
  USER = 'USER',
}
registerEnumType(UserStatus, { name: 'UserStatus' });
registerEnumType(UserStatusChangedBy, { name: 'UserStatusChangedBy' });
@ObjectType()
export class UserStatusInfo {
  id: string;
  user_id: string;
  status: UserStatus;
  status_changed_by: UserStatusChangedBy;
  @Field(() => GraphQLISODateTime)
  updated_at: Date;
  @Field(() => GraphQLISODateTime)
  created_at: Date;
}
