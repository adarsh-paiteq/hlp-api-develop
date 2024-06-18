import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ChatUser {
  id: string;
  chat_id: string;
  user_id: string;
  is_archived: boolean;
  is_deleted: boolean;
  @Field(() => GraphQLISODateTime)
  created_at: string;
  @Field(() => GraphQLISODateTime)
  updated_at: string;
  @Field(() => String, { nullable: true })
  treatment_id?: string;
}
