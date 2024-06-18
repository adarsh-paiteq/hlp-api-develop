import { Module } from '@nestjs/common';
import { ServiceOfferPurchasesService } from './service-offer-purchases.service';
import { ServiceOfferPurchasesResolver } from './service-offer-purchases.resolver';
import { AuthModule } from '../shared/auth/auth.module';
import { ServiceOfferPurchasesRepo } from './service-offer-purchases.repo';
import { StripeService } from '../shared/services/stripe/stripe.service';

@Module({
  providers: [
    ServiceOfferPurchasesResolver,
    ServiceOfferPurchasesService,
    ServiceOfferPurchasesRepo,
    StripeService,
  ],
  imports: [AuthModule],
})
export class ServiceOfferPurchasesModule {}
