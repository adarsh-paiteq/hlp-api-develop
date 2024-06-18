import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserPollPostOption {
  id: string;
  user_id: string;
  poll_option_id: string;
  poll_post_id: string;
  is_selected: boolean;
  created_at: Date;
  updated_at: Date;
}
