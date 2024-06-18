import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ShopItemImages {
  file_path: string;
  image_id: string;
  image_url: string;
  created_at: string;
  updated_at: string;
  id: string;
  shop_item_id: string;
}
