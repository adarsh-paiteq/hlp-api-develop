import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsJWT, IsNotEmpty, IsString } from 'class-validator';
import { i18nValidationMessage } from '@core/modules/i18n-next';
import { PatientInvitation } from '../entities/patient-invitations.entity';

@ArgsType()
export class VerifyPatientInvitationArgs {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsJWT({ message: i18nValidationMessage('is_jwt') })
  @Field(() => String)
  token: string;
}

@ObjectType()
export class InvitePatientResponse {
  @Field(() => PatientInvitation)
  patientInvitation: PatientInvitation;
}
