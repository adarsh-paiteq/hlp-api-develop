import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ActionImages {
  file_path: string;
  image_id: string;
  image_url: string;
  created_at: string;
  updated_at: string;
  action_id: string;
  id: string;
}
