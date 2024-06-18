import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { GetChatResponse } from './get-chat.dto';
import { ChatType } from '@chats/entities/chat.entity';
import { SortOrder } from '@utils/utils.dto';
import { PaginationArgs } from '@shared/dto/pagination-params.dto';

@ArgsType()
export class StartChatArgs extends PaginationArgs {
  @Field(() => String, {
    description:
      'send userId(user/doctor) for ONE_ON_ONE chat and channelId for CHANNEL chat',
  })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  id: string;

  @Field(() => String, {
    description: 'required for treatment chat',
    nullable: true,
  })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  treatment_id?: string;

  @Field(() => ChatType, {
    description: `ChatType must be ${Object.values(ChatType)}`,
  })
  @IsEnum(ChatType, { message: i18nValidationMessage('is_enum') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  chatType: ChatType;

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
export class StartChatResponse extends GetChatResponse {}

export class CreateChatDto {
  id: string;
  chat_type: ChatType;
  channel_id?: string;
}

export class CreateChatUserDto {
  chat_id: string;
  user_id: string;
}
