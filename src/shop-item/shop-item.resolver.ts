import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Roles } from '@shared/decorators/roles.decorator';
import { JwtAuthGuard } from '@shared/guards/auth.guard';
import { RolesGuard } from '@shared/guards/roles.guard';
import { UserRoles } from '../users/users.dto';
import {
  GetShopCategoryAndShopItemRes,
  GetShopItemArgs,
  GetShopItemDetailResponse,
} from './dto/shop-item.dto';
import { ShopItem } from './entities/shop-item.entity';
import { ShopItemService } from './shop-item.service';
import { I18nNextLanguage } from '@shared/decorators/language.decorator';
import { GetUser } from '@shared/decorators/user.decorator';
import { LoggedInUser } from '@shared/auth/jwt.strategy';
import {
  GetShopItemCartResponse,
  GetShopItemCartArgs,
} from './dto/get-shop-item-cart.dto';
import {
  UpdateUserShippingAddressArgs,
  UpdateUserShippingAddressResponse,
} from './dto/update-user-shipping-address.dto';
import {
  GetPaymentStatusArgs,
  GetPaymentStatusResponse,
} from './dto/get-payment-status.dto';

@Resolver()
export class ShopItemResolver {
  constructor(private readonly shopItemService: ShopItemService) {}

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => ShopItem, { name: 'getShopItem' })
  async getShopItem(
    @Args() args: GetShopItemArgs,
    @I18nNextLanguage() lang: string,
  ): Promise<ShopItem> {
    return this.shopItemService.getShopItemById(args.shopItemId, lang);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => [GetShopCategoryAndShopItemRes], {
    name: 'getShopItemsByCategory',
  })
  async getShopItemsByCategory(
    @I18nNextLanguage() lang: string,
  ): Promise<GetShopCategoryAndShopItemRes[]> {
    return this.shopItemService.getShopItemsByCategory(lang);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetShopItemDetailResponse, {
    name: 'getShopItemDetails',
  })
  async getShopItemDetails(
    @Args() args: GetShopItemArgs,
    @I18nNextLanguage() lang: string,
  ): Promise<GetShopItemDetailResponse> {
    return this.shopItemService.getShopItemDetails(args.shopItemId, lang);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetShopItemCartResponse, { name: 'getShopItemCart' })
  async getShopItemCart(
    @Args() args: GetShopItemCartArgs,
    @GetUser() user: LoggedInUser,
  ): Promise<GetShopItemCartResponse> {
    return this.shopItemService.getShopItemCart(
      args.shopItemId,
      args.quantity,
      user.id,
    );
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => UpdateUserShippingAddressResponse, {
    name: 'updateUserShippingAddress',
  })
  async updateUserShippingAddress(
    @Args('input') inputs: UpdateUserShippingAddressArgs,
    @GetUser() user: LoggedInUser,
  ): Promise<UpdateUserShippingAddressResponse> {
    return this.shopItemService.upsertUserAddress(inputs, user.id);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetPaymentStatusResponse, { name: 'getShopItemPurchaseStatus' })
  async getShopItemPurchaseStatus(
    @Args() args: GetPaymentStatusArgs,
    @GetUser() user: LoggedInUser,
  ): Promise<GetPaymentStatusResponse> {
    return this.shopItemService.getShopItemPurchaseStatus(
      user.id,
      args.purchaseId,
    );
  }
}
