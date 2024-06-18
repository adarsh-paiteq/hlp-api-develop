import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Quote {
  id: string;
  image_id: string;
  image_url: string;
  file_path: string;
  created_at: string;
  updated_at: string;
}
