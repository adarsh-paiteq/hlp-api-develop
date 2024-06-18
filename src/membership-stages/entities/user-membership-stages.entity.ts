import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserMembershipStage {
  id: string;
  user_id: string;
  membership_stage_id: string;
  created_at: string;
  updated_at: string;
}
