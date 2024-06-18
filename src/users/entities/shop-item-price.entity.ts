import { ObjectType } from '@nestjs/graphql';
@ObjectType()
export class ShopItemPrice {
  id: string;
  shop_item_id: string;
  membership_stage_id: string;
  hlp_reward_points_required: number;
  item_price?: number;
  created_at: string;
  updated_at: string;
}
