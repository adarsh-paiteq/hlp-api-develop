import {
  ArgsType,
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { ChatMessageData } from './get-chat-messages.dto';
import { PaginationArgs } from '@shared/dto/pagination-params.dto';
import { ChatDetails } from './get-chat.dto';
import { GraphQLInt } from 'graphql';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { i18nValidationMessage } from '@core/modules/i18n-next';
import { Type } from 'class-transformer';

export enum ChatTypeFilter {
  PATIENTS = 'PATIENTS',
  DOCTOR = 'DOCTOR',
  CHANNEL = 'CHANNEL',
}
registerEnumType(ChatTypeFilter, { name: 'ChatTypeFilter' });

@InputType()
export class ChatListFilter {
  @Field(() => Boolean, { nullable: true })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  isArchived?: boolean;

  @Field(() => ChatTypeFilter, {
    nullable: true,
    description: `chatType must be ${Object.values(ChatTypeFilter)}`,
  })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsEnum(ChatTypeFilter, { message: i18nValidationMessage('is_enum') })
  chatType?: ChatTypeFilter;
}

@ArgsType()
export class GetChatListArgs extends PaginationArgs {
  @Field(() => ChatListFilter, { nullable: true })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @Type(() => ChatListFilter)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  filters?: ChatListFilter;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsString({ message: i18nValidationMessage('is_string') })
  @Field(() => String, { nullable: true })
  search?: string;
}

@ObjectType()
export class ChatList extends ChatDetails {
  @Field(() => ChatMessageData, { nullable: true })
  last_message: ChatMessageData;

  @Field(() => GraphQLInt)
  unread_messages_count: number;
}

@ObjectType()
export class GetChatListResponse {
  @Field(() => [ChatList], { nullable: true })
  chatList: ChatList[];

  @Field(() => Boolean, { defaultValue: false })
  hasMore: boolean;
}
