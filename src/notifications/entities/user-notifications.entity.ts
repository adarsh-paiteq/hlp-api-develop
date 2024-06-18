import {
  Field,
  GraphQLISODateTime,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { UserSchedule } from '@schedules/dto/get-dashboard.dto';

export enum UserNotificationType {
  CHANNEL_INVITATION = 'CHANNEL_INVITATION',
  FRIEND_REQUEST = 'FRIEND_REQUEST',
  TREATMENT_TIMELINE = 'TREATMENT_TIMELINE',
  TOOLKIT_PERFORMED_BY_USER = 'TOOLKIT_PERFORMED_BY_USER',
  POST_REACTION = 'POST_REACTION',
  COACH_ADDED_TO_TREATMENT_TEAM = 'COACH_ADDED_TO_TREATMENT_TEAM',
  COACH_ADDED_TO_PRIVATE_GROUP = 'COACH_ADDED_TO_PRIVATE_GROUP',
  POST_LIKED = 'POST_LIKED',
  INVITED_USER_REGISTERED = 'INVITED_USER_REGISTERED',
}

@ObjectType()
export class NotificationMetadata {
  @Field(() => UserSchedule, { nullable: true })
  agenda?: UserSchedule;
  user_id?: string;
  name?: string;
  treatment_id?: string;
  reaction_id?: string;
  post_id?: string;
  channel_id?: string;
  doctor_treatment_id?: string;
}

registerEnumType(UserNotificationType, { name: 'UserNotificationType' });
@ObjectType()
export class UserNotification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  is_read: boolean;
  @Field(() => String, { nullable: true })
  account_id?: string;
  page?: string;
  @Field(() => GraphQLISODateTime)
  created_at: string;
  @Field(() => GraphQLISODateTime)
  updated_at: string;
  type?: UserNotificationType;
  invitation_id?: string;
  @Field(() => NotificationMetadata, { nullable: true })
  metadata?: NotificationMetadata;
}
