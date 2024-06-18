import { HideField, ObjectType } from '@nestjs/graphql';
import { Translation } from '@utils/utils.dto';

@ObjectType()
export class Goal {
  age_group: string[];
  avatar: string;
  description: string;
  emoji_image_file_path: string;
  emoji_image_id: string;
  emoji_image_url: string;
  goal_info: string;
  title: string;
  created_at: string;
  updated_at: string;
  id: string;
  @HideField()
  translations?: Translation;
  is_default: boolean;
}
