import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PostVideo {
  thumbnail_image_id?: string;
  thumbnail_image_id_path?: string;
  thumb_nail_image_url?: string;
  video_id?: string;
  video_path: string;
  video_url: string;
  created_at: Date;
  updated_at: Date;
  content_editor_id?: string;
  id: string;
  post_id: string;
  user_id?: string;
}
