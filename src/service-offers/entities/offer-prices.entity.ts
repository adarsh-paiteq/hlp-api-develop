import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class OfferPrice {
  id: string;
  offer_id: string;
  membership_stage_id: string;
  hlp_reward_points_required: number;
  offer_price: number;
  created_at: string;
  updated_at: string;
}
