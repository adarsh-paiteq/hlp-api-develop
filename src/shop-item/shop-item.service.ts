import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  GetShopCategoryAndShopItemRes,
  GetShopItemDetailResponse,
} from './dto/shop-item.dto';
import { ShopItem } from './entities/shop-item.entity';
import { ShopItemRepo } from './shop-item.repo';
import { TranslationService } from '@shared/services/translation/translation.service';
import { MembershipStage } from '../membership-stages/membership-stages.model';
import { ConfigService } from '@nestjs/config';
import { EnvVariable } from '@core/configs/config';
import {
  GetShopItemCartResponse,
  ShopItemCartPrice,
} from './dto/get-shop-item-cart.dto';
import { UsersService } from '@users/users.service';
import {
  SaveUserAddressDTO,
  UpdateUserShippingAddressArgs,
  UpdateUserShippingAddressResponse,
} from './dto/update-user-shipping-address.dto';
import { MollieService } from '@shared/services/mollie/mollie.service';
import { Payment, PaymentStatus } from '@mollie/api-client';
import {
  ShopItemTransactionStatus,
  UpdateShopitemPurchase,
} from '@users/dto/purchase-shop-item.dto';
import { UsersRepo } from '@users/users.repo';
import { GetPaymentStatusResponse } from './dto/get-payment-status.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ShopItemPaymentSucceededEvent, UserEvent } from '@users/user.event';

@Injectable()
export class ShopItemService {
  private readonly logger = new Logger(ShopItemService.name);
  constructor(
    private readonly shopItemRepo: ShopItemRepo,
    private readonly translationService: TranslationService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly mollieService: MollieService,
    private readonly userRepo: UsersRepo,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getShopItemById(shopItemId: string, lang: string): Promise<ShopItem> {
    const getShopItem = await this.shopItemRepo.getShopItemById(shopItemId);
    if (!getShopItem) {
      throw new NotFoundException(`shop-item.shop_item_not_found`);
    }
    const [translatedGetShopItem] =
      this.translationService.getTranslations<ShopItem>(
        [getShopItem],
        ['extra_information_title', 'extra_information_description'],
        lang,
      );
    return translatedGetShopItem;
  }

  async getShopItemsByCategory(
    lang: string,
  ): Promise<GetShopCategoryAndShopItemRes[]> {
    const getShopItemCategory =
      await this.shopItemRepo.getShopItemsByCategory();

    if (!getShopItemCategory.length) {
      throw new NotFoundException(`shop-item.shop_item_category_not_found`);
    }

    const translatedShopItemCategory = getShopItemCategory.map((category) => {
      const [translatedCategory] =
        this.translationService.getTranslations<GetShopCategoryAndShopItemRes>(
          [category],
          ['title', 'description'],
          lang,
        );

      const translatedShopItems = category.shop_items.map((shopItem) => {
        const [translatedItem] =
          this.translationService.getTranslations<ShopItem>(
            [shopItem],
            [
              'title',
              'sub_title',
              'short_description',
              'description',
              'extra_information_title',
              'extra_information_description',
            ],
            lang,
          );

        const translatedMembershipStages = shopItem.shop_item_prices.map(
          (itemPrice) => {
            const [translatedMembershipStage] =
              this.translationService.getTranslations<MembershipStage>(
                [itemPrice.membership_stages],
                ['title', 'description'],
                lang,
              );
            return {
              ...itemPrice,
              membership_stages: translatedMembershipStage,
            };
          },
        );
        const translatedMembershipStagesResult = translatedMembershipStages;

        return {
          ...translatedItem,
          shop_item_prices: translatedMembershipStagesResult,
        };
      });
      const translatedItems = translatedShopItems;
      return {
        ...translatedCategory,
        shop_items: translatedItems,
      };
    });

    return translatedShopItemCategory;
  }

  async getShopItemDetails(
    shopItemId: string,
    lang: string,
  ): Promise<GetShopItemDetailResponse> {
    const getShopItemDetails = await this.shopItemRepo.getShopItemDetails(
      shopItemId,
    );
    if (!getShopItemDetails) {
      throw new NotFoundException(`shop-item.Shop_item_details_not_found`);
    }
    const [translatedShopItemDetails] =
      this.translationService.getTranslations<ShopItem>(
        [getShopItemDetails.shop_items],
        ['title', 'description', 'sub_title', 'short_description'],
        lang,
      );
    const translatedMembershipStages = getShopItemDetails.shop_item_prices.map(
      (membershipStage) => {
        const [translatedMembershipStage] =
          this.translationService.getTranslations<MembershipStage>(
            [membershipStage.membership_stage],
            ['title'],
            lang,
          );
        return {
          ...membershipStage,
          membership_stage: {
            ...membershipStage.membership_stage,
            ...translatedMembershipStage,
          },
        };
      },
    );
    const translatedShopItemWithPrices: GetShopItemDetailResponse = {
      shop_items_images: getShopItemDetails.shop_items_images,
      shop_items: translatedShopItemDetails,
      shop_item_prices: translatedMembershipStages,
    };
    return translatedShopItemWithPrices;
  }

  async getShopItemCart(
    shopItemId: string,
    quantity: number,
    userId: string,
  ): Promise<GetShopItemCartResponse> {
    const [shopItemPrice, userAddress] = await Promise.all([
      await this.usersService.getShopItemPriceAndHLPPoints({
        shop_item_id: shopItemId,
        user_id: userId,
      }),
      this.shopItemRepo.getUserAddress(userId),
    ]);

    const taxPercentage = this.configService.getOrThrow<number>(
      EnvVariable.TAX_PERCENTAGE,
    );
    const { item_price, shipping_cost } = shopItemPrice;
    const shippingCost = Number(shipping_cost);

    const subTotal = +(item_price * quantity).toFixed(2);
    const tax_amount = parseFloat(
      ((taxPercentage / 100) * subTotal).toFixed(2),
    );
    const grand_total = (subTotal + shippingCost + tax_amount).toFixed(2);

    const cart_prices: ShopItemCartPrice = {
      item_price,
      quantity,
      subTotal,
      shipping_cost: shippingCost,
      tax_amount,
      grand_total,
    };

    return {
      user_address: userAddress,
      cart_prices,
    };
  }

  async upsertUserAddress(
    userAddressInput: UpdateUserShippingAddressArgs,
    userId: string,
  ): Promise<UpdateUserShippingAddressResponse> {
    const userAddress = await this.shopItemRepo.getUserAddress(userId);
    if (userAddress) {
      const updatedUserAddress = await this.shopItemRepo.updateUserAddress(
        userAddressInput,
        userId,
      );
      return { user_shipping_address: updatedUserAddress };
    }
    const saveUserAddressInput: SaveUserAddressDTO = {
      ...userAddressInput,
      user_id: userId,
    };

    const saveUserAddress = await this.shopItemRepo.saveUserAddress(
      saveUserAddressInput,
    );
    return { user_shipping_address: saveUserAddress };
  }

  async updatePaymentStatus(paymentDetail: Payment): Promise<string> {
    const { id, method, settlementId } = paymentDetail;
    const purchaseId = paymentDetail.metadata.purchase_id;
    if (paymentDetail.status == PaymentStatus.paid) {
      const purchasedItem: UpdateShopitemPurchase = {
        transaction_status: ShopItemTransactionStatus.SUCCESS,
        transaction_reference_id: settlementId,
        event_id: id,
        payment_type: method,
      };
      const shopPurchasedItem = await this.userRepo.updateShopItemPurchase(
        purchaseId,
        purchasedItem,
      );
      this.eventEmitter.emit(
        UserEvent.SHOP_ITEM_PURCHASED,
        new ShopItemPaymentSucceededEvent(shopPurchasedItem),
      );
      return `Payment Successful`;
    } else if (
      paymentDetail.status == PaymentStatus.pending ||
      paymentDetail.status == PaymentStatus.authorized ||
      paymentDetail.status == PaymentStatus.open
    ) {
      const purchasedItem: UpdateShopitemPurchase = {
        transaction_status: ShopItemTransactionStatus.PENDING,
        transaction_reference_id: settlementId,
        event_id: id,
        payment_type: method,
      };

      await this.userRepo.updateShopItemPurchase(purchaseId, purchasedItem);
      return `Payment pending`;
    } else if (
      paymentDetail.status == PaymentStatus.canceled ||
      paymentDetail.status == PaymentStatus.expired
    ) {
      const purchasedItem: UpdateShopitemPurchase = {
        transaction_status: ShopItemTransactionStatus.CANCELED,
        transaction_reference_id: settlementId,
        event_id: id,
        payment_type: method,
      };
      await this.userRepo.updateShopItemPurchase(purchaseId, purchasedItem);
      return `Payment canceled`;
    } else if (paymentDetail.status == PaymentStatus.failed) {
      const purchasedItem: UpdateShopitemPurchase = {
        transaction_status: ShopItemTransactionStatus.FAILED,
        transaction_reference_id: settlementId,
        event_id: id,
        payment_type: method,
      };
      await this.userRepo.updateShopItemPurchase(purchaseId, purchasedItem);
      return `Payment Failed`;
    }
    return 'OK';
  }

  async webhookMollie(id: string): Promise<string> {
    const paymentDetails = await this.mollieService.getPaymentDetails(id);
    const purchaseId = paymentDetails.metadata.purchase_id;
    if (purchaseId) {
      return await this.updatePaymentStatus(paymentDetails);
    }

    return 'OK';
  }

  async getShopItemPurchaseStatus(
    userId: string,
    purchaseId: string,
  ): Promise<GetPaymentStatusResponse> {
    const purchase = await this.shopItemRepo.getPaymentStatusByPurchseId(
      userId,
      purchaseId,
    );
    if (!purchase) {
      throw new NotFoundException(`shop-item.transection_not_found`);
    }
    const { transaction_status } = purchase;
    return { transaction_status };
  }
}
