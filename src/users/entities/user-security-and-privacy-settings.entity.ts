import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserSecurityAndPrivacySetting {
  id: string;
  user_id: string;
  app_access_pin: string;
  app_lock_enabled: boolean;
  my_posts_can_be_seen_by_all_users: boolean;
  my_posts_can_be_seen_by_my_friends: boolean;
  is_profile_anonymous: boolean;
  @Field(() => GraphQLISODateTime)
  created_at: string;
  @Field(() => GraphQLISODateTime)
  updated_at: string;
  otp_login_enabled: boolean;
  is_access_pin_added: boolean;
}
