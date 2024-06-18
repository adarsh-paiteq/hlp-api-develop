import { ChatMessage } from '@chats/entities/chat-message.entity';
import { ArgsType, Field, ObjectType, PickType } from '@nestjs/graphql';
import { ChatUserInfo } from './get-chat.dto';
import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { i18nValidationMessage } from '@core/modules/i18n-next';
import { PaginationArgs } from '@shared/dto/pagination-params.dto';
import { SortOrder } from '@utils/utils.dto';

@ArgsType()
export class GetChatMessagesArgs extends PaginationArgs {
  @Field(() => String)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  chatId: string;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsEnum(SortOrder, { message: i18nValidationMessage('is_enum') })
  @Field(() => SortOrder, {
    nullable: true,
    defaultValue: SortOrder.ASC,
    description: `SortOrder must be ${Object.values(SortOrder)}`,
  })
  sortOrder: SortOrder;
}

@ObjectType()
export class ChatMessageAttachment {
  @Field(() => String)
  id: string;

  @Field(() => String)
  file_path: string;

  @Field(() => String)
  file_type: string;

  @Field(() => String, { nullable: true })
  thumbnail_image_id?: string;

  @Field(() => String, { nullable: true })
  thumbnail_image_id_path?: string;

  @Field(() => String, { nullable: true })
  thumbnail_image_url?: string;
}

@ObjectType()
export class ChatMessageData extends PickType(ChatMessage, [
  'id',
  'chat_id',
  'message',
  'is_read',
  'created_at',
]) {
  @Field(() => ChatUserInfo)
  user: ChatUserInfo;

  @Field(() => [ChatMessageAttachment], { nullable: true })
  attachments: ChatMessageAttachment[];
}

@ObjectType()
export class GetChatMessagesResponse {
  @Field(() => Boolean, { defaultValue: false })
  hasMore: boolean;

  @Field(() => [ChatMessageData], { nullable: true })
  chatMessages: ChatMessageData[];
}
