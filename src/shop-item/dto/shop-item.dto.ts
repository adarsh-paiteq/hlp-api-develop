import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { ShopItemPrice } from '../../users/entities/shop-item-price.entity';
import { MembershipStage } from '../../membership-stages/membership-stages.model';
import { ShopCategory } from '../entities/shop-category.entitiy';
import { ShopItem } from '../entities/shop-item.entity';
import { ShopItemImages } from '../entities/shop-item_images.entity';
import { i18nValidationMessage } from '@core/modules/i18n-next';

@ArgsType()
export class GetShopItemArgs {
  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  shopItemId: string;
}

@ObjectType()
export class ShopItemPricesAndMembershipStage extends ShopItemPrice {
  @Field(() => MembershipStage)
  membership_stages: MembershipStage;
}

@ObjectType()
export class GetShopItemAndPrices extends ShopItem {
  @Field(() => [ShopItemPricesAndMembershipStage], { nullable: 'items' })
  shop_item_prices: ShopItemPricesAndMembershipStage[];
}

@ObjectType()
export class GetShopCategoryAndShopItemRes extends ShopCategory {
  @Field(() => [GetShopItemAndPrices], { nullable: 'items' })
  shop_items: GetShopItemAndPrices[];
}

@ObjectType()
export class GetShopItemAndPricesWithMembership {
  @Field(() => ShopItemPrice)
  shop_item_price: ShopItemPrice;

  @Field(() => MembershipStage)
  membership_stage: MembershipStage;
}
@ObjectType()
export class GetShopItemDetailResponse {
  @Field(() => ShopItem)
  shop_items: ShopItem;

  @Field(() => [ShopItemImages], { nullable: 'items' })
  shop_items_images: ShopItemImages[];

  @Field(() => [GetShopItemAndPricesWithMembership], { nullable: 'items' })
  shop_item_prices: GetShopItemAndPricesWithMembership[];
}
