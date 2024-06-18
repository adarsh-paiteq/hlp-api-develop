import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Service {
  id: string;
  title: string;
  short_description: string;
  description: string;
  service_category_id: string;
  service_company_id: string;
  image_url: string;
  image_id: string;
  file_path: string;
  created_at: string;
  updated_at: string;
}
