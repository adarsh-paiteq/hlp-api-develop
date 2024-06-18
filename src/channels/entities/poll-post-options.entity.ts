import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PollPostOption {
  name: string;
  id: string;
  poll_post_id: string;
  created_at: Date;
  updated_at: Date;
}
