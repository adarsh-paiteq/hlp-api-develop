import { Injectable } from '@nestjs/common';
import { Database } from '../core/modules/database/database.service';
import { UserMembershipStage } from '../membership-stages/entities/user-membership-stages.entity';
import { UserDto } from '../users/users.dto';
import { OfferPrice } from './entities/offer-prices.entity';
import { ServiceOfferPurchase } from './entities/service-offer-purchase.entity';
import { ServiceOffer } from '../service-offers/entities/service-offer.entity';

@Injectable()
export class ServiceOfferPurchasesRepo {
  constructor(private readonly database: Database) {}

  async getServiceOfferById(serviceOfferId: string): Promise<ServiceOffer> {
    const query = `SELECT * FROM service_offers WHERE id=$1`;
    const [serviceOffer] = await this.database.query<ServiceOffer>(query, [
      serviceOfferId,
    ]);
    return serviceOffer;
  }

  async saveServiceOfferPurchase(
    serviceOfferPurchase: ServiceOfferPurchase,
  ): Promise<ServiceOfferPurchase> {
    const {
      user_id,
      coupon_code,
      hlp_points,
      service_offer_id,
      transaction_status,
    } = serviceOfferPurchase;
    const query = `INSERT INTO service_offer_purchases
    (user_id, service_offer_id, hlp_points, transaction_status, coupon_code)
    VALUES ($1, $2, ${hlp_points}, $3, $4) RETURNING *;`;
    const [serviceOffer] = await this.database.query<ServiceOfferPurchase>(
      query,
      [user_id, service_offer_id, transaction_status, coupon_code],
    );

    return serviceOffer;
  }

  async getUser(userId: string): Promise<UserDto> {
    const query = `SELECT * FROM users where id = $1`;
    const [user] = await this.database.query<UserDto>(query, [userId]);
    return user;
  }

  async getServiceOfferPrices(serviceOfferId: string): Promise<OfferPrice[]> {
    const query = `SELECT offer_prices.*,membership_stages.sequence_number AS sequence_number FROM offer_prices
    JOIN membership_stages ON membership_stages.id=offer_prices.membership_stage_id
    WHERE offer_id=$1
    ORDER BY sequence_number DESC`;
    const prices = await this.database.query<OfferPrice>(query, [
      serviceOfferId,
    ]);
    return prices;
  }

  async getUserMemberStages(userId: string): Promise<UserMembershipStage[]> {
    const query = `SELECT user_membership_stages.*,membership_stages.sequence_number AS sequence_number  FROM user_membership_stages
    JOIN membership_stages ON membership_stages.id=user_membership_stages.membership_stage_id
    WHERE user_membership_stages.user_id=$1
    ORDER BY sequence_number DESC`;
    const userMembershipStages = await this.database.query<UserMembershipStage>(
      query,
      [userId],
    );
    return userMembershipStages;
  }
}
