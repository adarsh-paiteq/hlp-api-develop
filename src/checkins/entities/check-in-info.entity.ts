import { HideField, ObjectType } from '@nestjs/graphql';
import { Translation } from '@utils/utils.dto';

@ObjectType()
export class CheckInInfo {
  id: string;
  description: string;
  image_id: string;
  image_url: string;
  title: string;
  file_path: string;
  @HideField()
  translations?: Translation;
}
