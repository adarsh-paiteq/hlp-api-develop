import { i18nValidationMessage } from '@core/modules/i18n-next';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { InsertDoctorGroup } from './create-groups.dto';
import { ChannelInvitationStatus } from '../entities/channel-invitations.entity';

@InputType()
export class UpdateGroupInvitationStatusInput {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field(() => String)
  invitationId: string;

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
export class AddUserGroup extends InsertDoctorGroup {}

@ObjectType()
export class UpdateGroupInvitationStatusResponse {
  @Field(() => String)
  message: string;
}
