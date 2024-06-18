import { HideField, ObjectType } from '@nestjs/graphql';
import { Translation } from '@utils/utils.dto';

@ObjectType()
export class GoalInfo {
  id: string;
  description: string;
  image_id: string;
  title: string;
  image_url: string;
  file_path: string;
  @HideField()
  translations?: Translation;
}
