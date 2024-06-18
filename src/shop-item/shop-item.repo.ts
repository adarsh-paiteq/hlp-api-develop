import { Database } from '@core/modules/database/database.service';
import { Injectable } from '@nestjs/common';
import {
  GetShopCategoryAndShopItemRes,
  GetShopItemDetailResponse,
} from './dto/shop-item.dto';
import { ShopItem } from './entities/shop-item.entity';
import { UserAddress } from '@users/entities/user-address.entity';
import {
  SaveUserAddressDTO,
  UpdateUserShippingAddressArgs,
} from './dto/update-user-shipping-address.dto';
import { GetPaymentStatus } from './entities/get-payment-status.entity';

@Injectable()
export class ShopItemRepo {
  constructor(private readonly database: Database) {}
  async getShopItemById(shopItemId: string): Promise<ShopItem> {
    const shopItemQuery = `SELECT shop_items.*,CAST(shipping_cost AS INTEGER) AS shipping_cost FROM shop_items WHERE shop_items.id = $1;`;
    const [getShopItem] = await this.database.query<ShopItem>(shopItemQuery, [
      shopItemId,
    ]);
    return getShopItem;
  }

  async getShopItemsByCategory(): Promise<GetShopCategoryAndShopItemRes[]> {
    const getShopItemCategoryQuery = `
    SELECT shop_category.*,
    COALESCE(JSON_AGG(shop_items.*) FILTER (WHERE shop_items.id IS NOT NULL),'[]') AS shop_items
    FROM
    shop_category
    LEFT JOIN (SELECT shop_items.*,JSON_AGG(shop_item_prices.*) AS shop_item_prices
    FROM shop_items
    LEFT JOIN (SELECT shop_item_prices.*, ROW_TO_JSON(membership_stages.*) AS membership_stages
    FROM shop_item_prices 
    JOIN membership_stages ON membership_stages.id =  shop_item_prices.membership_stage_id
    )shop_item_prices ON shop_item_prices.shop_item_id=shop_items.id
    GROUP BY shop_items.id
    ) shop_items ON shop_items.shop_category_id = shop_category.id
    GROUP BY shop_category.id
    ORDER BY shop_category.created_at DESC
    `;
    const getShopItemCategory =
      await this.database.query<GetShopCategoryAndShopItemRes>(
        getShopItemCategoryQuery,
        [],
      );
    return getShopItemCategory;
  }

  async getShopItemDetails(
    shopItemId: string,
  ): Promise<GetShopItemDetailResponse> {
    const getShopItemDetailQuery = `
    SELECT
    to_json(shop_items.*) AS "shop_items",
    to_json(shop_items_images.shop_items_images) AS "shop_items_images",
    to_json(shop_item_prices.shop_item_prices) AS "shop_item_prices"
    FROM
    shop_items 
    LEFT JOIN (
      SELECT shop_items_images.shop_item_id, array_agg(shop_items_images.*) AS shop_items_images
      FROM shop_items_images
      GROUP BY shop_items_images.shop_item_id
    ) shop_items_images ON shop_items_images.shop_item_id = shop_items.id
    LEFT JOIN (
      SELECT
        shop_item_prices.shop_item_id,
        json_agg(json_build_object(
          'shop_item_price', shop_item_prices.*,
          'membership_stage', membership_stages.*
        )) AS shop_item_prices
      FROM shop_item_prices
      LEFT JOIN membership_stages ON membership_stages.id = shop_item_prices.membership_stage_id
      GROUP BY shop_item_prices.shop_item_id
    ) shop_item_prices ON shop_item_prices.shop_item_id = shop_items.id
    WHERE
    shop_items.id =$1;
    `;
    const [getShopItemDetails] =
      await this.database.query<GetShopItemDetailResponse>(
        getShopItemDetailQuery,
        [shopItemId],
      );
    return getShopItemDetails;
  }

  async getUserAddress(userId: string): Promise<UserAddress> {
    const query = `SELECT * FROM user_addresses WHERE user_addresses.user_id = $1;
`;
    const [userAddress] = await this.database.query<UserAddress>(query, [
      userId,
    ]);
    return userAddress;
  }

  async updateUserAddress(
    userAddressInput: UpdateUserShippingAddressArgs,
    userId: string,
  ): Promise<UserAddress> {
    const parameters = [...Object.values(userAddressInput), userId];
    const query =
      'UPDATE user_addresses SET ' +
      Object.keys(userAddressInput)
        .map((key, index) => `${key} = $${index + 1}`)
        .join(', ') +
      ` WHERE user_id = $${parameters.length} RETURNING *;`;
    const [updatedUserAddress] = await this.database.query<UserAddress>(
      query,
      parameters,
    );
    return updatedUserAddress;
  }

  async saveUserAddress(
    userAddressInput: SaveUserAddressDTO,
  ): Promise<UserAddress> {
    const query = `INSERT INTO user_addresses (${Object.keys(
      userAddressInput,
    )}) VALUES (${Object.keys(userAddressInput).map(
      (value, index) => `$${index + 1}`,
    )}) RETURNING *;`;

    const [saveUserAddress] = await this.database.query<UserAddress>(
      query,
      Object.values(userAddressInput),
    );
    return saveUserAddress;
  }

  async getPaymentStatusByPurchseId(
    userId: string,
    purchaseId: string,
  ): Promise<GetPaymentStatus> {
    const query = `SELECT shop_item_purchases.transaction_status FROM shop_item_purchases WHERE shop_item_purchases.user_id = $1 AND shop_item_purchases.id = $2`;
    const [transaction_status] = await this.database.query<GetPaymentStatus>(
      query,
      [userId, purchaseId],
    );
    return transaction_status;
  }
}
