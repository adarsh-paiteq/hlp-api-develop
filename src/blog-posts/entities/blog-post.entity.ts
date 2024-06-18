import { HideField, ObjectType } from '@nestjs/graphql';
import { Translation } from '@utils/utils.dto';

@ObjectType()
export class BlogPost {
  day_offer_date?: string;
  show_order?: number;
  age_group?: string;
  avatar: string;
  blog_author?: string;
  blog_link?: string;
  blog_type: string;
  description: string;
  extra_information_description?: string;
  extra_information_title?: string;
  file_path: string;
  image_id: string;
  image_url: string;
  short_description: string;
  title: string;
  created_at: string;
  updated_at: string;
  id: string;
  tool_kit?: string;
  @HideField()
  translations?: Translation;
}
