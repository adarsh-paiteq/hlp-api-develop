import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserTookit {
  id: string;
  title: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  note?: string;
}
