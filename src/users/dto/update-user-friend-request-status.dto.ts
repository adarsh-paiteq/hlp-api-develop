import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ChannelInvitationStatus } from '@groups/entities/channel-invitations.entity';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';

@InputType()
export class UpdateFriendRequestStatusInput {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field(() => String)
  requestId: string;

  @IsEnum(ChannelInvitationStatus, {
    message: i18nValidationMessage('is_enum'),
  })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field(() => ChannelInvitationStatus, {
    nullable: false,
    description: `status must be ${Object.values(ChannelInvitationStatus)}`,
  })
  status: ChannelInvitationStatus;
}

@ObjectType()
export class UpdateFriendRequestStatusResponse {
  @Field(() => String)
  message: string;
}
