import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AdminPostRead {
  admin_post_id: string;
  user_id: string;
  id: string;
  created_at: string;
  updated_at: string;
}
