import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  PurchaseServiceOfferArgs,
  PurchaseServiceOfferResponse,
} from './service-offer-purchases.model';
import { ServiceOfferPurchasesRepo } from './service-offer-purchases.repo';
import { nanoid } from 'nanoid';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { PaymentTransactionStatus } from '../users/users.dto';
import { EnvVariable } from '@core/configs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  ServiceOfferPurchasedEevent,
  ServiceOfferPurchasesEvent,
} from './service-offer-purchases.event';
import { ServiceOfferPurchase } from './entities/service-offer-purchase.entity';
import { GetServiceOfferPointsResponse } from './dto/get-service-offer-price.dto';
import { TranslationService } from '@shared/services/translation/translation.service';
@Injectable()
export class ServiceOfferPurchasesService {
  private readonly logger = new Logger(ServiceOfferPurchasesService.name);
  constructor(
    private readonly serviceOfferPurchasesRepo: ServiceOfferPurchasesRepo,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
    private readonly translationService: TranslationService,
  ) {}

  async generatePaymentIntent(
    serviceOfferPurchaseId: string,
    offerPrice: number,
  ): Promise<Stripe.PaymentIntentCreateParams> {
    const intent = {
      amount: offerPrice * 100,
      currency: this.configService.get(EnvVariable.CURRENCY),
      description: 'Service Offer Purchase payment Test',
      metadata: { serviceOfferPurchaseId },
    };
    return intent;
  }

  async purchaseServiceOffer(
    args: PurchaseServiceOfferArgs,
    userId: string,
  ): Promise<PurchaseServiceOfferResponse> {
    this.logger.debug(`${args},${userId}`);
    const [serviceOffer, user] = await Promise.all([
      this.serviceOfferPurchasesRepo.getServiceOfferById(args.serviceOfferId),
      this.serviceOfferPurchasesRepo.getUser(userId),
    ]);
    if (!serviceOffer || !user) {
      throw new NotFoundException(
        `service-offer-purchases.service_offer_or_user_not_found`,
      );
    }
    if (!serviceOffer.hlp_points_needed_to_redeem_offer) {
      throw new NotFoundException(
        `${serviceOffer.title} ${this.translationService.translate(
          'service-offer-purchases.has_no_hlp_points',
        )}`,
      );
    }

    let hlp_points = serviceOffer.hlp_points_needed_to_redeem_offer;
    const [offerPrices, userMembershipStages] = await Promise.all([
      this.serviceOfferPurchasesRepo.getServiceOfferPrices(args.serviceOfferId),
      this.serviceOfferPurchasesRepo.getUserMemberStages(userId),
    ]);

    if (offerPrices.length) {
      const offerPrice = offerPrices.find((offerPrice) => {
        const hasCurrentMembershipStage =
          offerPrice.membership_stage_id === user.current_membership_stage_id;
        const hasMembershipStage = userMembershipStages.map(
          (stage) => stage.membership_stage_id,
        );
        return (
          hasCurrentMembershipStage ||
          hasMembershipStage.includes(offerPrice.membership_stage_id)
        );
      });
      if (offerPrice) {
        hlp_points = offerPrice.hlp_reward_points_required;
      }
    }

    const hasRequiredPoints = user.hlp_reward_points_balance >= hlp_points;
    if (!hasRequiredPoints) {
      throw new BadRequestException(
        `service-offer-purchases.insufficient_hlp_points_to_purchase`,
      );
    }

    const { id: serviceOfferId } = serviceOffer;
    const couponCode = nanoid(8);

    const newOfferPurchase: ServiceOfferPurchase = {
      user_id: userId,
      service_offer_id: serviceOfferId,
      hlp_points,
      coupon_code: couponCode,
      transaction_status: PaymentTransactionStatus.SUCCESS,
    };
    this.logger.log(
      `Service Offer Purchase: ${JSON.stringify(newOfferPurchase)}`,
    );
    const savedOfferPurchase =
      await this.serviceOfferPurchasesRepo.saveServiceOfferPurchase(
        newOfferPurchase,
      );
    if (!savedOfferPurchase) {
      throw new BadRequestException(
        `service-offer-purchases.failed_to save_service_offer_purchase`,
      );
    }
    this.eventEmitter.emit(
      ServiceOfferPurchasesEvent.SERVICE_OFFER_PURCHASED,
      new ServiceOfferPurchasedEevent(savedOfferPurchase),
    );
    return {
      message: this.translationService.translate(
        `service-offer-purchases.success`,
      ),
    };
  }

  async getServiceOfferPoints(
    userId: string,
    serviceOfferId: string,
  ): Promise<GetServiceOfferPointsResponse> {
    const serviceOffer =
      await this.serviceOfferPurchasesRepo.getServiceOfferById(serviceOfferId);
    if (!serviceOffer) {
      throw new NotFoundException(
        `service-offer-purchases.service_offer_not_found`,
      );
    }
    let hlp_points = serviceOffer.hlp_points_needed_to_redeem_offer;
    const [offerPrices, userMembershipStages] = await Promise.all([
      this.serviceOfferPurchasesRepo.getServiceOfferPrices(serviceOfferId),
      this.serviceOfferPurchasesRepo.getUserMemberStages(userId),
    ]);

    if (offerPrices.length) {
      const offerPrice = offerPrices.find((offerPrice) => {
        const hasMembershipStage = userMembershipStages.map(
          (stage) => stage.membership_stage_id,
        );
        return hasMembershipStage.includes(offerPrice.membership_stage_id);
      });
      if (offerPrice) {
        this.logger.log(
          `Using offer price for ${offerPrice.membership_stage_id}`,
        );
        hlp_points = offerPrice.hlp_reward_points_required;
      }
    }
    return {
      points: hlp_points,
    };
  }
}
