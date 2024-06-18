import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DoctorTreatment {
  created_at: Date;
  updated_at: Date;
  id: string;
  doctor_id: string;
  treatment_id: string;
  is_deleted: boolean;
  is_owner: boolean;
  role: string;
  is_archived: boolean;
  updated_by?: string;
  created_by?: string;
}
