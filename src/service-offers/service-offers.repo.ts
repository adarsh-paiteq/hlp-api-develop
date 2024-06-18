import { Injectable } from '@nestjs/common';
import { Database } from '../core/modules/database/database.service';
import { GetOfferDetails } from './dto/service-offers.dto';
import { Users } from '../users/users.model';
import { ServiceOfferWithPrice } from './dto/get-service-offers.dto';
import { ServiceCategoryWithService } from './dto/get-service-list.dto';

@Injectable()
export class ServiceOffersRepo {
  constructor(private readonly database: Database) {}

  async getOfferDetails(offerId: string): Promise<GetOfferDetails> {
    const query = `SELECT
    to_json(service_offers.*) AS "service_offers",
    to_json(service_companies.*) AS "service_companies",
    to_json(offer_images.offer_images) AS "offer_images",
    to_json(offer_prices.offer_prices) AS "offer_prices"
    FROM
    service_offers 
    LEFT JOIN services ON services.id = service_offers.service_id
    LEFT JOIN service_companies ON service_companies.id = services.service_company_id
    LEFT JOIN (
      SELECT offer_id, array_agg(offer_images.*) AS offer_images
      FROM offer_images
      GROUP BY offer_id
    ) offer_images ON offer_images.offer_id = service_offers.id
    LEFT JOIN (
      SELECT
        offer_id,
        json_agg(json_build_object(
          'id', offer_prices.id,
          'offer_price', offer_prices.offer_price,
          'hlp_reward_points_required', offer_prices.hlp_reward_points_required,
          'offer_id', offer_prices.offer_id,
          'membership_stage', membership_stages.*
        )) AS offer_prices
      FROM offer_prices
      LEFT JOIN membership_stages ON membership_stages.id = offer_prices.membership_stage_id
      GROUP BY offer_id
    ) offer_prices ON offer_prices.offer_id = service_offers.id
    WHERE
    service_offers.id = $1;
  `;
    const [offerDetail] = await this.database.query<GetOfferDetails>(query, [
      offerId,
    ]);
    return offerDetail;
  }

  async getServiceOffers(serviceId: string): Promise<ServiceOfferWithPrice[]> {
    const query = `SELECT service_offers.*,
    ROW_TO_JSON(service_companies.*) AS service_companies,
    COALESCE(JSON_AGG(offer_prices.*) FILTER (WHERE offer_prices IS NOT NULL),'[]') AS offer_prices
    FROM service_offers
    LEFT JOIN services ON services.id=service_offers.service_id
    LEFT JOIN service_companies ON service_companies.id = services.service_company_id
    LEFT JOIN (SELECT offer_prices.*, ROW_TO_JSON(membership_stages.*) AS membership_stage
    FROM membership_stages 
    JOIN offer_prices ON offer_prices.membership_stage_id = membership_stages.id) 
    offer_prices ON offer_prices.offer_id=service_offers.id
    WHERE service_offers.service_id= $1
    GROUP BY service_offers.id, services.id, service_companies.id
  `;
    const serviceOffer = await this.database.query<ServiceOfferWithPrice>(
      query,
      [serviceId],
    );
    return serviceOffer;
  }

  async getUserById(userId: string): Promise<Users> {
    const query = `SELECT * FROM users where id = $1`;
    const [user] = await this.database.query<Users>(query, [userId]);
    return user;
  }

  async getServicesList(): Promise<ServiceCategoryWithService[]> {
    const query = `SELECT service_categories.*,
    COALESCE(JSON_AGG(services.*) FILTER (WHERE services IS NOT NULL),'[]') AS services
    FROM service_categories
    LEFT JOIN (SELECT services.*, ROW_TO_JSON(service_companies.*) AS service_companies, 
    COALESCE(JSON_AGG(DISTINCT service_offers.*) FILTER (WHERE service_offers.service_id IS NOT NULL), '[]') AS service_offers
    FROM services 
    JOIN service_companies ON service_companies.id = services.service_company_id
    JOIN service_offers ON service_offers.service_id = services.id 
    GROUP BY services.id, service_companies.id) 
    services ON services.service_category_id=service_categories.id
    GROUP BY service_categories.id
  `;
    const serviceList = await this.database.query<ServiceCategoryWithService>(
      query,
      [],
    );
    return serviceList;
  }
}
