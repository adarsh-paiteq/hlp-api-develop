import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { LoggedInUser } from '../shared/auth/jwt.strategy';
import { Roles } from '../shared/decorators/roles.decorator';
import { GetUser } from '../shared/decorators/user.decorator';
import { JwtAuthGuard } from '../shared/guards/auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { UserRoles } from '../users/users.dto';
import {
  GetServiceOfferPointsArgs,
  GetServiceOfferPointsResponse,
} from './dto/get-service-offer-price.dto';
import {
  PurchaseServiceOfferArgs,
  PurchaseServiceOfferResponse,
} from './service-offer-purchases.model';
import { ServiceOfferPurchasesService } from './service-offer-purchases.service';

@Resolver()
export class ServiceOfferPurchasesResolver {
  constructor(
    private readonly serviceOfferPurchasesService: ServiceOfferPurchasesService,
  ) {}

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => PurchaseServiceOfferResponse)
  async purchaseServiceOffer(
    @GetUser() user: LoggedInUser,
    @Args() args: PurchaseServiceOfferArgs,
  ): Promise<PurchaseServiceOfferResponse> {
    return this.serviceOfferPurchasesService.purchaseServiceOffer(
      args,
      user.id,
    );
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetServiceOfferPointsResponse)
  async getServiceOfferPoints(
    @GetUser() user: LoggedInUser,
    @Args() args: GetServiceOfferPointsArgs,
  ): Promise<GetServiceOfferPointsResponse> {
    return this.serviceOfferPurchasesService.getServiceOfferPoints(
      user.id,
      args.serviceOfferId,
    );
  }
}
