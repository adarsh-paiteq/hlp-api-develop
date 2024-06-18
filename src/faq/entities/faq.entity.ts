import { HideField, ObjectType } from '@nestjs/graphql';
import { Translation } from '@utils/utils.dto';

@ObjectType()
export class Faq {
  id: string;
  faq_category_id: string;
  title: string;
  faq_type: string;
  question: string;
  answer: string;
  video_url: string;
  created_at: string;
  updated_at: string;
  extra_information_title?: string;
  extra_information_description?: string;
  video_id?: string;
  video_path?: string;
  @HideField()
  translations?: Translation;
}
