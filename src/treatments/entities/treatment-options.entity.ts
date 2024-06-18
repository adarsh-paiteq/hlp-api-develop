import { HideField, ObjectType } from '@nestjs/graphql';
import { TreatmentType } from '@treatments/enum/treatments.enum';
import { Translation } from '@utils/utils.dto';

@ObjectType()
export class TreatmentOption {
  file_path: string;
  image_id: string;
  image_url: string;
  title: string;
  created_at: string;
  updated_at: string;
  id: string;
  @HideField()
  treatment_type: TreatmentType;
  @HideField()
  translations?: Translation;
}
