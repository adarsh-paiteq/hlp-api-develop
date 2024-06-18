import { i18nValidationMessage } from '@core/modules/i18n-next';
import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import {
  IsNotEmpty,
  ValidateIf,
  IsString,
  IsUUID,
  ValidateNested,
  IsEnum,
} from 'class-validator';

import { Type } from 'class-transformer';
import {
  ChatFileType,
  ChatFileUpload,
} from '@chats/entities/chat-file-upload.entity';
import { ChatMessage } from '@chats/entities/chat-message.entity';
import { ChatMessageData } from './get-chat-messages.dto';
import { Chat } from '@chats/entities/chat.entity';

@InputType()
export class ChatMessageAttachments {
  @Field(() => String)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsString({ message: i18nValidationMessage('is_string') })
  file_id: string;

  @Field(() => String)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsString({ message: i18nValidationMessage('is_string') })
  file_path: string;

  @Field(() => String)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsString({ message: i18nValidationMessage('is_string') })
  file_url: string;

  @Field(() => ChatFileType)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsEnum(ChatFileType, { message: i18nValidationMessage('is_enum') })
  file_type: ChatFileType;

  @Field(() => String, { nullable: true })
  @ValidateIf((input: ChatFileUpload) => input.file_type === ChatFileType.VIDEO)
  @IsString({ message: i18nValidationMessage('is_string') })
  thumbnail_image_url?: string;

  @Field(() => String, { nullable: true })
  @ValidateIf((input: ChatFileUpload) => input.file_type === ChatFileType.VIDEO)
  @IsString({ message: i18nValidationMessage('is_string') })
  thumbnail_image_id?: string;

  @Field(() => String, { nullable: true })
  @ValidateIf((input: ChatFileUpload) => input.file_type === ChatFileType.VIDEO)
  @IsString({ message: i18nValidationMessage('is_string') })
  thumbnail_image_id_path?: string;
}

@InputType()
export class CreateChatMessageInput {
  @Field(() => String)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  chatId: string;

  @Field(() => String, { nullable: true })
  @ValidateIf((input: CreateChatMessageInput) => !input.attachments?.length)
  @IsString({ message: i18nValidationMessage('is_string') })
  message?: string;

  @Field(() => [ChatMessageAttachments], {
    nullable: true,
  })
  @Type(() => ChatMessageAttachments)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  attachments: ChatMessageAttachments[];
}

@ObjectType()
export class CreateChatMessageResponse {
  @Field(() => ChatMessageData)
  chatMessage: ChatMessageData;

  @Field(() => Chat)
  chat: Chat;
}

export class CreateChatMessageDTO extends PickType(ChatMessage, [
  'chat_id',
  'message',
  'sender_id',
]) {}

export class CreateChatFileUploadsDTO extends PickType(ChatFileUpload, [
  'chat_id',
  'chat_message_id',
  'user_id',
  'file_id',
  'file_path',
  'file_type',
  'file_url',
  'thumbnail_image_id',
  'thumbnail_image_id_path',
  'thumbnail_image_url',
]) {}
