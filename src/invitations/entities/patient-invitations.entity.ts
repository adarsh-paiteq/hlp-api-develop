import { HideField, ObjectType } from '@nestjs/graphql';
import { TreatmentRoles } from '../../treatments/dto/add-treatment.dto';

export enum PaitentInvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
}

@ObjectType()
export class PatientInvitation {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  doctor_id: string;
  organization_id: string;
  treatment_option_id: string;
  treatment_role: TreatmentRoles;
  @HideField()
  token_id: string;
  created_at: string;
  updated_at: string;
}
