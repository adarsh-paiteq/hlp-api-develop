import { Field, HideField, ObjectType } from '@nestjs/graphql';
import { Translation } from '@utils/utils.dto';

@ObjectType()
export class ItemSize {
  @Field()
  title: string;
}

@ObjectType()
export class ShopItem {
  id: string;
  title: string;
  sub_title: string;
  short_description: string;
  description: string;
  image_url: string;
  image_id: string;
  file_path: string;
  shop_category_id: string;
  link_url?: string;
  created_at: string;
  updated_at: string;
  item_price?: string;
  hlp_points_required_to_buy_item?: string;
  extra_information_title?: string;
  extra_information_description?: string;
  @HideField()
  translations?: Translation;
  is_size_available: boolean;
  @Field(() => [ItemSize])
  item_sizes?: ItemSize[];
  shipping_cost: number;
}
