import { ObjectType } from '@nestjs/graphql';
import { ShopItemTransactionStatus } from '@users/dto/purchase-shop-item.dto';

@ObjectType()
export class GetPaymentStatus {
  transaction_status: ShopItemTransactionStatus;
}
