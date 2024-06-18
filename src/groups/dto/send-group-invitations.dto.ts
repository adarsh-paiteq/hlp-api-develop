import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ChannelInvitationStatus } from '../entities/channel-invitations.entity';

@ArgsType()
export class SendGroupInvitationArgs {
  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsString({ message: i18nValidationMessage('is_string') })
  groupId: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsString({ message: i18nValidationMessage('is_string') })
  userId: string;
}

@ObjectType()
export class SendGroupInvitationResponse {
  @Field(() => String)
  message: string;
}
export class SendGroupInvitationInput {
  user_id: string;
  channel_id: string;
  status: ChannelInvitationStatus;
  doctor_id: string;
}
