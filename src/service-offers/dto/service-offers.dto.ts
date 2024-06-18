import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';
import { MembershipStage } from '../../membership-stages/membership-stages.model';
import { OfferImage } from '../entities/offer-images.entity';
import { ServiceCompany } from '../entities/service-company.entity';
import { ServiceOffer } from '../entities/service-offer.entity';
import { i18nValidationMessage } from '@core/modules/i18n-next';

@ArgsType()
export class ServiceOfferArgs {
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field()
  offerId: string;
}

@ObjectType()
export class GetOfferPriceAndMembershipStage {
  @Field()
  id: string;
  @Field()
  offer_price: number;
  @Field()
  hlp_reward_points_required: number;
  @Field(() => MembershipStage, { nullable: true })
  membership_stage: MembershipStage;
}

@ObjectType()
export class GetOfferDetails {
  @Field(() => ServiceOffer, { nullable: true })
  service_offers: ServiceOffer;
  @Field(() => [OfferImage], { nullable: 'items' })
  offer_images: OfferImage[];
  @Field(() => ServiceCompany, { nullable: true })
  service_companies: ServiceCompany;
  @Field(() => [GetOfferPriceAndMembershipStage], { nullable: 'items' })
  offer_prices: GetOfferPriceAndMembershipStage[];
}
