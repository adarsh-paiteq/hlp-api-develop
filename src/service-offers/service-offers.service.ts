import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { GetOfferDetails } from './dto/service-offers.dto';
import { ServiceOffersRepo } from './service-offers.repo';
import { GetServiceOfferResponse } from './dto/get-service-offers.dto';
import { GetServiceListResponse } from './dto/get-service-list.dto';
import { TranslationService } from '@shared/services/translation/translation.service';
import { ServiceOffer } from './entities/service-offer.entity';
import { ServiceCompany } from './entities/service-company.entity';
import { MembershipStage } from '../membership-stages/membership-stages.model';

@Injectable()
export class ServiceOffersService {
  private readonly logger = new Logger(ServiceOffersService.name);
  constructor(
    private readonly serviceOfferRepo: ServiceOffersRepo,
    private readonly translationService: TranslationService,
  ) {}
  async getOfferDetails(
    offerId: string,
    lang: string,
  ): Promise<GetOfferDetails> {
    const serviceOffer = await this.serviceOfferRepo.getOfferDetails(offerId);

    const [translatedServiceOffer] =
      this.translationService.getTranslations<ServiceOffer>(
        [serviceOffer.service_offers],
        [
          'extra_information_description',
          'description',
          'extra_information_title',
          'offer_label',
          'short_description',
          'title',
        ],
        lang,
      );

    const [translatedServiceCompany] =
      this.translationService.getTranslations<ServiceCompany>(
        [serviceOffer.service_companies],
        ['company_name', 'company_bio', 'extra_information'],
        lang,
      );

    const translatedOfferPrices = serviceOffer.offer_prices.map(
      (membershipStage) => {
        const [translatedMembershipStage] =
          this.translationService.getTranslations<MembershipStage>(
            [membershipStage.membership_stage],
            ['title', 'description'],
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
    return {
      offer_images: serviceOffer.offer_images,
      service_offers: translatedServiceOffer,
      offer_prices: translatedOfferPrices,
      service_companies: translatedServiceCompany,
    };
  }

  async getServiceOffers(
    userId: string,
    serviceId: string,
  ): Promise<GetServiceOfferResponse> {
    const [serviceOffer, user] = await Promise.all([
      this.serviceOfferRepo.getServiceOffers(serviceId),
      this.serviceOfferRepo.getUserById(userId),
    ]);
    if (!serviceOffer.length) {
      throw new NotFoundException(`service-offers.Service_offer_not_found`);
    }

    if (!user) {
      throw new NotFoundException(`service-offers.User_not_found`);
    }

    return { serviceOffers: serviceOffer, user: user };
  }

  async getServicesList(userId: string): Promise<GetServiceListResponse> {
    const [serviceList, user] = await Promise.all([
      this.serviceOfferRepo.getServicesList(),
      this.serviceOfferRepo.getUserById(userId),
    ]);

    if (!user) {
      throw new NotFoundException(`service-offers.User_not_found`);
    }

    return { serviceList: serviceList, user: user };
  }
}
