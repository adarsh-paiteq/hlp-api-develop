import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  @Field(() => String, { nullable: true })
  message?: string;
  is_read: boolean;
  is_deleted: boolean;
  @Field(() => String)
  created_at: Date;
  @Field(() => String)
  updated_at: Date;
}
