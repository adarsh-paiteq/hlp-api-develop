import {
  ArgsType,
  Field,
  GraphQLISODateTime,
  ObjectType,
  PickType,
} from '@nestjs/graphql';
import { ChatType } from '@chats/entities/chat.entity';
import { Users } from '@users/users.model';
import { Channel } from '@channels/entities/channel.entity';
import { ChatMessageData } from './get-chat-messages.dto';
import { i18nValidationMessage } from '@core/modules/i18n-next';
import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { SortOrder } from '@utils/utils.dto';
import { PaginationArgs } from '@shared/dto/pagination-params.dto';

@ArgsType()
export class GetChatArgs extends PaginationArgs {
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
export class ChatUserInfo extends PickType(Users, [
  'id',
  'avatar_image_name',
  'user_name',
  'first_name',
  'last_name',
  'role',
  'avatar_type',
]) {
  @Field(() => String, { nullable: true })
  file_path?: string;
}

@ObjectType()
export class ChatChannelInfo extends PickType(Channel, [
  'id',
  'title',
  'description',
  'short_description',
  'image_file_path',
  'total_followers',
]) {}

@ObjectType()
export class ChatDetails {
  @Field(() => String)
  chat_id: string;

  @Field(() => String, { nullable: true })
  treatment_id?: string;

  @Field(() => ChatType)
  chat_type: ChatType;

  @Field(() => ChatUserInfo)
  user: ChatUserInfo;

  @Field(() => ChatChannelInfo, {
    nullable: true,
    description: `data will be availabe only If ChatType is ${ChatType.CHANNEL}`,
  })
  channel?: ChatChannelInfo;

  @Field(() => Boolean)
  is_disabled: boolean;

  @Field(() => Boolean)
  is_archived: boolean;

  @Field(() => Boolean)
  is_deleted: boolean;

  @Field(() => GraphQLISODateTime)
  created_at: string;
}

@ObjectType()
export class GetChatResponse {
  @Field(() => ChatDetails)
  chat: ChatDetails;

  @Field(() => Boolean)
  isActive: boolean;

  @Field(() => Boolean, { defaultValue: false })
  hasMore: boolean;

  @Field(() => [ChatMessageData], { nullable: true })
  chatMessages: ChatMessageData[];
}
