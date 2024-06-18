import { HideField, ObjectType } from '@nestjs/graphql';
import { Translation } from '@utils/utils.dto';

@ObjectType()
export class ServiceCompany {
  company_bio: string;
  company_name: string;
  extra_information: string;
  file_path: string;
  image_id: string;
  image_url: string;
  created_at: string;
  updated_at: string;
  id: string;
  @HideField()
  translations?: Translation;
}
