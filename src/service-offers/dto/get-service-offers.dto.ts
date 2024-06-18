import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { MembershipStage } from '../../membership-stages/membership-stages.model';
import { ServiceCompany } from '../entities/service-company.entity';
import { ServiceOffer } from '../entities/service-offer.entity';
import { OfferPrice } from '../entities/offer-prices.entity';
import { Users } from '../../users/users.model';
import { i18nValidationMessage } from '@core/modules/i18n-next';

@ArgsType()
export class GetServiceOffersArgs {
  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  serviceId: string;
}

@ObjectType()
export class OfferPricesAndMembershipStage extends OfferPrice {
  @Field(() => MembershipStage)
  membership_stage: MembershipStage;
}

@ObjectType()
export class ServiceOfferWithPrice extends ServiceOffer {
  @Field(() => ServiceCompany)
  service_companies: ServiceCompany;

  @Field(() => [OfferPricesAndMembershipStage])
  offer_prices: OfferPricesAndMembershipStage[];
}

@ObjectType()
export class GetServiceOfferResponse {
  @Field(() => [ServiceOfferWithPrice])
  serviceOffers: ServiceOfferWithPrice[];

  @Field(() => Users)
  user: Users;
}
