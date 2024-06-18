import { HideField, ObjectType } from '@nestjs/graphql';
import { TreatmentType } from '@treatments/enum/treatments.enum';

@ObjectType()
export class Treatment {
  created_at: Date;
  updated_at: Date;
  id: string;
  option_id: string;
  user_id: string;
  is_deleted: boolean;
  @HideField()
  treatment_type: TreatmentType;
  has_participated_in_start_program: boolean;
}
