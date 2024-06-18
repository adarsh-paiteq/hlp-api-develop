import { ChatUser } from '@chats/entities/chat-user.entity';
import { i18nValidationMessage } from '@core/modules/i18n-next';
import {
  ArgsType,
  Field,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { IsBoolean, IsNotEmpty, IsString, IsUUID } from 'class-validator';

@ArgsType()
export class UpdateArchivedUnarchiveStatusArgs {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field(() => String)
  chatId: string;
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field(() => Boolean)
  isArchived: boolean;
}
@ObjectType()
export class UpdateUserChatArchiveStatusRes {
  @Field(() => String)
  message: string;
}

export class ChatUserUpdate extends PartialType(
  PickType(ChatUser, ['is_archived', 'is_deleted']),
) {}
