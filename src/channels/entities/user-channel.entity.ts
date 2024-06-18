import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserChannel {
  is_channel_unfollowed: boolean;
  @Field(() => GraphQLISODateTime)
  created_at: string;
  @Field(() => GraphQLISODateTime)
  updated_at: string;
  channel_id: string;
  id: string;
  user_id: string;
  /**
   * @deprecated This @field hash_new_post is deprecated and will be removed in future.
   * Use a@field has_new_post column name.
   */
  hash_new_post: boolean;
  has_new_post: boolean;
  last_post_created_at: string;
  organisation_id?: string;
  created_by?: string;
  updated_by?: string;
}
