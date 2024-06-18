import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum ChatFileType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
}

registerEnumType(ChatFileType, { name: 'ChatFileType' });

@ObjectType()
export class ChatFileUpload {
  id: string;
  chat_id: string;
  chat_message_id: string;
  user_id: string;
  file_id: string;
  file_path: string;
  file_url: string;
  @Field(() => ChatFileType)
  file_type: ChatFileType;
  @Field(() => String, { nullable: true })
  thumbnail_image_url?: string;
  @Field(() => String, { nullable: true })
  thumbnail_image_id?: string;
  @Field(() => String, { nullable: true })
  thumbnail_image_id_path?: string;
  @Field(() => String)
  created_at: Date;
  @Field(() => String)
  updated_at: Date;
}
