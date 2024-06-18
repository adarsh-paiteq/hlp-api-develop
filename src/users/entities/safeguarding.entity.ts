import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SafeGuarding {
  safeguarding_info: string;
  created_at: string;
  updated_at: string;
  id: string;
}
