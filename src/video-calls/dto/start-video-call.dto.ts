import { ArgsType, Field, ObjectType } from '@nestjs/graphql';

import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ChatType } from '@chats/entities/chat.entity';

@ArgsType()
export class StartVideoCallArgs {
  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  id: string;

  @Field(() => String, { nullable: true })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  treatment_id?: string;

  @Field(() => ChatType, {
    description: `ChatType must be ${Object.values(ChatType)}`,
  })
  @IsEnum(ChatType, { message: i18nValidationMessage('is_enum') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  chatType: ChatType;
}

@ObjectType()
export class StartVideoCallResponse {
  @Field(() => String)
  token: string;

  @Field(() => String)
  url: string;

  @Field(() => String)
  jitsiBaseUrl: string;

  @Field(() => String)
  roomId: string;

  @Field(() => String)
  roomSubject: string;

  @Field(() => ChatType)
  videoCallType: ChatType;
}
