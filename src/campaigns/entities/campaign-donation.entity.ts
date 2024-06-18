import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CampaignDonation {
  id: string;
  user_id: string;
  campaign_id: string;
  @Field(() => Int)
  hlp_reward_points_donated: number;
  created_at: string;
  updated_at: string;
}
