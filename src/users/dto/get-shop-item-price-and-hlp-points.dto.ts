import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field, Int, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';

@ArgsType()
export class GetShopItemPriceAndHLPPointsArgs {
  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  shopItemId: string;
}

@ObjectType()
export class ShopItemPriceAndHLPPointsOutput {
  @Field(() => Int, { nullable: true })
  hlp_points: number | null;
  @Field(() => String, { nullable: true })
  message?: string;
  @Field(() => Int, { nullable: true })
  item_price: number;
}
