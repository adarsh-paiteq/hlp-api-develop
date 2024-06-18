import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { Roles } from '@shared/decorators/roles.decorator';
import { JwtAuthGuard } from '@shared/guards/auth.guard';
import { RolesGuard } from '@shared/guards/roles.guard';
import { UserRoles } from '../users/users.dto';
import { GetOfferDetails, ServiceOfferArgs } from './dto/service-offers.dto';
import { ServiceOffersService } from './service-offers.service';
import { GetUser } from '@shared/decorators/user.decorator';
import { LoggedInUser } from '@shared/auth/jwt.strategy';
import {
  GetServiceOfferResponse,
  GetServiceOffersArgs,
} from './dto/get-service-offers.dto';
import { GetServiceListResponse } from './dto/get-service-list.dto';
import { I18nNextLanguage } from '@shared/decorators/language.decorator';
@Resolver()
export class ServiceOffersResolver {
  constructor(private readonly serviceOffersService: ServiceOffersService) {}

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetOfferDetails, {
    name: 'getOfferDetails',
  })
  async getOfferDetails(
    @Args() args: ServiceOfferArgs,
    @I18nNextLanguage() lang: string,
  ): Promise<GetOfferDetails> {
    return this.serviceOffersService.getOfferDetails(args.offerId, lang);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetServiceOfferResponse, {
    name: 'getServiceOffers',
  })
  async getServiceOffers(
    @GetUser() user: LoggedInUser,
    @Args() args: GetServiceOffersArgs,
  ): Promise<GetServiceOfferResponse> {
    return this.serviceOffersService.getServiceOffers(user.id, args.serviceId);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetServiceListResponse, {
    name: 'getServicesList',
  })
  async getServicesList(
    @GetUser() user: LoggedInUser,
  ): Promise<GetServiceListResponse> {
    return this.serviceOffersService.getServicesList(user.id);
  }
}
