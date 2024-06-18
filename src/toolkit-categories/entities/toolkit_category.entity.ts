import { HideField, ObjectType } from '@nestjs/graphql';
import { Translation } from '@utils/utils.dto';

@ObjectType()
export class ToolkitCategory {
  avatar: string;
  background_colour: string;
  description: string;
  extra_information_description?: string;
  extra_information_title?: string;
  file_path: string;
  image_id: string;
  image_url: string;
  text_colour: string;
  title: string;
  created_at: string;
  updated_at: string;
  id: string;
  @HideField()
  translations?: Translation;
}
