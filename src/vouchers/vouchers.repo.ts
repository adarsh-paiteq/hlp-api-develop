import { Injectable } from '@nestjs/common';
import { Database } from '@core/modules/database/database.service';
import { ShopitemPurchase } from '../users/users.dto';
@Injectable()
export class VouchersRepo {
  constructor(private readonly database: Database) {}

  async getShopItemPurchaseByVoucher(
    voucherCode: string,
  ): Promise<ShopitemPurchase> {
    const query = `SELECT * FROM shop_item_purchases WHERE shop_item_purchases.voucher_code = $1`;
    const [shopItemPurchase] = await this.database.query<ShopitemPurchase>(
      query,
      [voucherCode],
    );
    return shopItemPurchase;
  }

  async updateShopItemVoucherCodeAsRedeemed(
    voucherCode: string,
    referenceId: string,
  ): Promise<ShopitemPurchase> {
    const query =
      'UPDATE shop_item_purchases SET is_redeemed = $1, transaction_reference_id = $2 WHERE voucher_code = $3 RETURNING *;';
    const [shopItemPurchase] = await this.database.query<ShopitemPurchase>(
      query,
      [true, referenceId, voucherCode],
    );
    return shopItemPurchase;
  }
}
