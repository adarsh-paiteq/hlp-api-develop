import { Injectable } from '@nestjs/common';
import { Database } from '../core/modules/database/database.service';
import { User } from '../users/users.dto';
import { GetCampaignDetailsResponse } from './dto/campaigns.dto';
import { CampaignDonation } from './entities/campaign-donation.entity';
import { Campaign } from './entities/campaign.entity';
import { Campaigns } from './dto/get-campaign-list.dto';

@Injectable()
export class CampaignsRepo {
  constructor(private readonly database: Database) {}

  /**
   * @description it is used in  DonateToCampaign resolvers function which is been used from app side.
   */
  async getCampaign(id: string): Promise<Campaign> {
    const query = `SELECT * FROM campaign WHERE id=$1`;
    const [campaign] = await this.database.query<Campaign>(query, [id]);
    return campaign;
  }

  /**
   * @description it is used in  DonateToCampaign resolvers function which is been used from app side.
   */
  async markCampaignAsCompleted(id: string): Promise<Campaign> {
    const query = `UPDATE campaign SET is_campaign_goal_fulfilled=true  WHERE id=$1 RETURNING *; `;
    const [campaign] = await this.database.query<Campaign>(query, [id]);
    return campaign;
  }

  /**
   * @description it is used in  DonateToCampaign resolvers function which is been used from app side.
   */
  async getCampaignDonationAggregate(id: string): Promise<number> {
    const query = `SELECT CAST(SUM(hlp_reward_points_donated) AS INTEGER) AS total FROM campaign_donations WHERE campaign_id=$1  GROUP BY campaign_id`;
    const [donations] = await this.database.query<{ total: number }>(query, [
      id,
    ]);
    return donations ? donations.total : 0;
  }

  /**
   * @description it is used in  DonateToCampaign resolvers function which is been used from app side.
   */
  async createDonation(
    campaignId: string,
    points: number,
    userId: string,
  ): Promise<CampaignDonation> {
    const query = `INSERT INTO campaign_donations (hlp_reward_points_donated,campaign_id,user_id) VALUES ($1,$2,$3) RETURNING *; `;
    const [donation] = await this.database.query<CampaignDonation>(query, [
      points,
      campaignId,
      userId,
    ]);
    return donation;
  }

  /**
   * @description it is used in  DonateToCampaign resolvers function which is been used from app side.
   */
  async getUser(userId: string): Promise<User> {
    const query = `SELECT * FROM users where id = $1`;
    const [user] = await this.database.query<User>(query, [userId]);
    return user;
  }

  /**
   * @deprecated it is used in  getCampaign resolver function which is not used from app side.
   */
  async getCampaignById(campaignId: string): Promise<Campaign> {
    const campaignQuery = `SELECT * FROM campaign where id = $1`;
    const [getCampaign] = await this.database.query<Campaign>(campaignQuery, [
      campaignId,
    ]);
    return getCampaign;
  }

  /**
   * @description it is used in  getCampaignDetails resolver function which is been used from app side.
   */
  async getCampaignDetails(
    campaignId: string,
  ): Promise<GetCampaignDetailsResponse> {
    const campaignDetailQuery = `
    SELECT campaign.*,
    COALESCE(SUM(campaign_donations.hlp_reward_points_donated), 0) AS total_reward_points_donated,
    COALESCE(JSON_AGG(DISTINCT campaign_images.*) FILTER (WHERE campaign_images.id IS NOT NULL),'[]') AS campaign_images
    FROM campaign
    LEFT JOIN campaign_donations ON campaign_donations.campaign_id=campaign.id
    LEFT JOIN campaign_images ON campaign_images.campaign_id=campaign.id
    WHERE campaign.id=$1
    GROUP BY campaign.id
    `;
    const [campaignDetail] =
      await this.database.query<GetCampaignDetailsResponse>(
        campaignDetailQuery,
        [campaignId],
      );
    return campaignDetail;
  }

  async getAllCampaignList(): Promise<Campaigns[]> {
    const getCampaignListQuery = `
    SELECT campaign.*,
    COALESCE(SUM(campaign_donations.hlp_reward_points_donated),0) AS total_hlp_points_donated
    FROM
    campaign
    LEFT JOIN campaign_donations ON campaign.id = campaign_donations.campaign_id
    GROUP BY campaign.id
    `;
    const getCampaignList = await this.database.query<Campaigns>(
      getCampaignListQuery,
      [],
    );
    return getCampaignList;
  }
}
