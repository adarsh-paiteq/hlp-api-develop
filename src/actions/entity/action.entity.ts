import { HideField, ObjectType } from '@nestjs/graphql';
import { Translation } from '@utils/utils.dto';

@ObjectType()
export class Action {
  id: string;
  title: string;
  sub_title: string;
  short_description: string;
  description: string;
  action_type: string;
  membership_stage_id: string;
  link_url: string;
  image_url: string;
  image_id: string;
  file_path: string;
  created_at: Date;
  updated_at: Date;
  @HideField()
  translations?: Translation;
}
