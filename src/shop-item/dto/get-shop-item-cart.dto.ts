import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field, Int, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';
import { UserAddress } from '@users/entities/user-address.entity';
@ArgsType()
export class GetShopItemCartArgs {
  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  shopItemId: string;

  @IsNumber()
  @Field(() => Int)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  quantity: number;
}

@ObjectType()
export class ShopItemCartPrice {
  @Field(() => Number)
  quantity: number;
  @Field(() => Number)
  item_price: number;
  @Field(() => Number)
  subTotal: number;
  @Field(() => Number)
  shipping_cost: number;
  @Field(() => Number)
  tax_amount: number;
  @Field(() => String)
  grand_total: string;
}
@ObjectType()
export class GetShopItemCartResponse {
  @Field(() => ShopItemCartPrice)
  cart_prices: ShopItemCartPrice;

  @Field(() => UserAddress, { nullable: true })
  user_address: UserAddress;
}
