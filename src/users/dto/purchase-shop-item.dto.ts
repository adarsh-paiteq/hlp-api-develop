import {
  Field,
  InputType,
  Int,
  ObjectType,
  PickType,
  registerEnumType,
} from '@nestjs/graphql';
import {
  IsMobilePhone,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { i18nValidationMessage } from '@core/modules/i18n-next';
import { PartialType } from '@nestjs/mapped-types';
import { ShopitemPurchase } from '../users.dto';

@InputType()
export class ShippingAddress {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field()
  first_name: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field()
  last_name: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field()
  street_address: string;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsString({ message: i18nValidationMessage('is_string') })
  @Field(() => String, { nullable: true })
  street_address1?: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field()
  city: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field()
  postal_code: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsMobilePhone('any', { message: i18nValidationMessage('is_mobile_phone') })
  @Field()
  mobile_number: string;
}

export enum ShopItemTransactionStatus {
  SUCCESS = 'SUCCESS',
  PENDING = 'PENDING',
  CANCELED = 'CANCELED',
  FAILED = 'FAILED',
}

registerEnumType(ShopItemTransactionStatus, {
  name: 'ShopItemTransactionStatus',
});
@InputType()
export class PurchaseShopItemInput {
  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  shop_item_id: string;

  @Field(() => Int)
  @IsNumber({}, { message: i18nValidationMessage('is_number') })
  item_quantity: number;

  @Field(() => String, { nullable: true })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  item_size?: string;
}

@ObjectType()
export class PurchaseShopItemResponse {
  @Field(() => String)
  payment_secret: string;

  @Field(() => String)
  checkout_url: string;

  @Field(() => ShopitemPurchase)
  order: ShopitemPurchase;
}

export class UserAddressDto extends ShippingAddress {
  user_id: string;
}

export class ShopitemPurchaseDto extends PickType(ShopitemPurchase, [
  'user_id',
  'shop_item_id',
  'transaction_status',
  'item_price',
  'user_address_id',
  'tax',
  'tax_percentage',
  'shipping_charges',
  'hlp_reward_points_redeemd',
  'sub_total',
  'grand_total',
  'item_quantity',
  'item_size',
  'transaction_reference_id',
]) {}

export class UpdateShopitemPurchase extends PartialType(ShopitemPurchase) {}
