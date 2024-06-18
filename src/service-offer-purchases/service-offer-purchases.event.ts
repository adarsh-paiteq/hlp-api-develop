import { ServiceOfferPurchase } from './entities/service-offer-purchase.entity';

export enum ServiceOfferPurchasesEvent {
  SERVICE_OFFER_PURCHASED = 'SERVICE_OFFER_PURCHASED',
}

export class ServiceOfferPurchasedEevent {
  constructor(public serviceOfferPurchase: ServiceOfferPurchase) {}
}
