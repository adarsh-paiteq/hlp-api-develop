import { Field, InputType, ObjectType, PartialType } from '@nestjs/graphql';
import { IsEmail, IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { i18nValidationMessage } from '@core/modules/i18n-next';
import { PaitentInvitationStatus } from '../entities/patient-invitations.entity';
import { OmitType } from '@nestjs/mapped-types';
import { TreatmentRoles } from '../../treatments/dto/add-treatment.dto';
import {
  OauthUser,
  OauthUserAddedBy,
} from '@oauth/entities/oauth-users.entity';

@InputType()
export class InvitePatientInput {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field(() => String)
  first_name: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field(() => String)
  last_name: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsEmail({}, { message: i18nValidationMessage('is_email":') })
  @Field(() => String)
  email: string;

  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsEnum(TreatmentRoles, { message: i18nValidationMessage('is_enum') })
  @Field(() => TreatmentRoles, {
    description: `TreatmentRoles must be ${Object.values(TreatmentRoles)}`,
  })
  treatment_role: TreatmentRoles;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field(() => String)
  treatment_option_id: string;
}

@ObjectType()
export class InvitePatientOutput {
  @Field(() => String)
  message: string;
}

export class InsertPatientInvitation extends InvitePatientInput {
  id: string;
  token_id: string;
  organization_id: string;
  doctor_id: string;
  status: PaitentInvitationStatus;
}

export class UpdatePatientInvitation extends OmitType(InsertPatientInvitation, [
  'email',
  'id',
]) {}

export class InsertAddOauthUser {
  email: string;
  activation_code: string;
  added_by: OauthUserAddedBy;
  organisation_id: string;
  display_name?: string;
}
export class UpdateOauthUser extends PartialType(OauthUser) {}
