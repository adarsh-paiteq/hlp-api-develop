import { Field, HideField, ObjectType } from '@nestjs/graphql';
import { Translation } from '@utils/utils.dto';

@ObjectType()
export class SupportVideos {
  id: string;
  support_video_category_id: string;
  title: string;
  short_description: string;
  image_url: string;
  image_id: string;
  file_path: string;
  video_url: string;
  @Field({ nullable: true })
  video_id?: string;
  @Field({ nullable: true })
  video_path?: string;
  created_at: string;
  updated_at: string;
  @HideField()
  translations?: Translation;
}
