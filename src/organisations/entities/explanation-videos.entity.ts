import { HideField, ObjectType } from '@nestjs/graphql';
import { Translation } from '@utils/utils.dto';

@ObjectType()
export class ExplanationVideos {
  id: string;
  title: string;
  short_description: string;
  description: string;
  video_url: string;
  video_path: string;
  video_id: string;
  image_id: string;
  image_url: string;
  file_path: string;
  @HideField()
  organisations: string[];
  created_at: Date;
  updated_at: Date;
  @HideField()
  translations?: Translation;
}
