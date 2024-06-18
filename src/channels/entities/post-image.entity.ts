import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PostImage {
  file_path: string;
  image_id: string;
  image_url: string;
  created_at: Date;
  updated_at: Date;
  content_editor_id?: string;
  id: string;
  post_id: string;
  user_id?: string;
}
