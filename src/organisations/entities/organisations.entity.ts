import { HideField, ObjectType } from '@nestjs/graphql';
import { Translation } from '@utils/utils.dto';

@ObjectType()
export class Organisation {
  status: boolean;
  is_default: boolean;
  area: string;
  city: string;
  country: string;
  email: string;
  file_path: string;
  help_center_link: string;
  image_id: string;
  image_url: string;
  name: string;
  phone_number: string;
  postal_code: string;
  privacy_policy_link: string;
  state: string;
  street: string;
  terms_and_conditions_link: string;
  website_link: string;
  created_at: Date;
  updated_at: Date;
  id: string;
  @HideField()
  translations: Translation;
}
