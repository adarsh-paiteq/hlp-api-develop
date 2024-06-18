import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  HLPPointsDonatedToCampaignEvent,
  UserEvent,
} from '../users/user.event';
import { CampaignDonation } from '../users/users.dto';
import { CampaignsRepo } from './campaigns.repo';
import { GetCampaignDetailsResponse } from './dto/campaigns.dto';
import { DonateToCampaignArgs } from './dto/donate-to-campaign';
import { Campaign } from './entities/campaign.entity';
import { Campaigns, CampaignListResponse } from './dto/get-campaign-list.dto';
import { TranslationService } from '@shared/services/translation/translation.service';

@Injectable()
export class CampaignsService {
  constructor(
    private readonly campaignsRepo: CampaignsRepo,
    private readonly eventEmitter: EventEmitter2,
    private readonly translationService: TranslationService,
  ) {}

  /**
   * @description it is used in  DonateToCampaign resolver which is been used from app side.
   */
  async donateToCampaign(
    userId: string,
    args: DonateToCampaignArgs,
  ): Promise<CampaignDonation> {
    const { campaign_id, points } = args;
    const [user, campaign] = await Promise.all([
      this.campaignsRepo.getUser(userId),
      this.campaignsRepo.getCampaign(campaign_id),
    ]);
    if (!user || !campaign) {
      throw new NotFoundException(`campaigns.user_campaign_not_found`);
    }
    const hasSufficientPoints =
      user.hlp_reward_points_balance &&
      user.hlp_reward_points_balance >= points;
    if (!hasSufficientPoints) {
      throw new BadRequestException(`campaigns.insufficient_hlp_point_donate`);
    }
    const totalDonations =
      await this.campaignsRepo.getCampaignDonationAggregate(campaign_id);
    const isCampaignGoalReached = totalDonations >= campaign.campaign_goal;
    if (isCampaignGoalReached) {
      await this.campaignsRepo.markCampaignAsCompleted(campaign_id);
      throw new BadRequestException(
        `${campaign.title} ${this.translationService.translate(
          'campaigns.not_accepting_fulfilled_donation',
        )} `,
      );
    }
    const donation = await this.campaignsRepo.createDonation(
      campaign_id,
      points,
      userId,
    );
    if (totalDonations + points >= campaign.campaign_goal) {
      await this.campaignsRepo.markCampaignAsCompleted(campaign_id);
    }
    this.eventEmitter.emit(
      UserEvent.HLP_POINTS_DONATED_TO_CAMPAIGN,
      new HLPPointsDonatedToCampaignEvent(
        donation.user_id,
        donation.hlp_reward_points_donated,
      ),
    );
    return donation;
  }

  /**
   * @deprecated it is used in  getCampaign resolver which is not used from app side.
   */
  async getCampaignById(campaignId: string): Promise<Campaign> {
    const getCampaign = await this.campaignsRepo.getCampaignById(campaignId);
    if (!getCampaign) {
      throw new NotFoundException(`campaigns.campaign_not_found`);
    }
    return getCampaign;
  }

  /**
   * @description it is used in  getCampaignDetails resolver which is been used from app side.
   */
  async getCampaignDetails(
    campaignId: string,
    lang?: string,
  ): Promise<GetCampaignDetailsResponse> {
    const campaignDetail = await this.campaignsRepo.getCampaignDetails(
      campaignId,
    );
    if (!campaignDetail) {
      throw new NotFoundException(`campaigns.campaign_not_found`);
    }
    const [translatedCampaignDetail] =
      this.translationService.getTranslations<GetCampaignDetailsResponse>(
        [campaignDetail],
        [
          'title',
          'sub_name',
          'sub_title',
          'short_description',
          'description',
          'extra_information_title',
          'extra_information_description',
        ],
        lang,
      );
    return translatedCampaignDetail;
  }

  async getCampaignList(lang: string): Promise<CampaignListResponse> {
    const campaignList = await this.campaignsRepo.getAllCampaignList();
    const translatedCampaignList =
      this.translationService.getTranslations<Campaigns>(
        campaignList,
        ['title', 'short_description'],
        lang,
      );
    return this.filterCampaignByCompletionStatus(translatedCampaignList);
  }

  private filterCampaignByCompletionStatus(
    campaigns: Campaigns[],
  ): CampaignListResponse {
    const campaignList: CampaignListResponse = {
      campaigns: [],
      previous_campaigns: [],
    };
    campaigns.forEach((campaign) => {
      const campaignInfo: Campaigns = {
        title: campaign.title,
        image_id: campaign.image_id,
        id: campaign.id,
        image_url: campaign.image_url,
        file_path: campaign.file_path,
        campaign_goal: campaign.campaign_goal,
        is_campaign_goal_fulfilled: campaign.is_campaign_goal_fulfilled,
        total_hlp_points_donated: campaign.total_hlp_points_donated || 0,
        short_description: campaign.short_description,
      };
      if (!campaign.is_campaign_goal_fulfilled) {
        campaignList.campaigns.push(campaignInfo);
      } else {
        campaignList.previous_campaigns.push(campaignInfo);
      }
    });
    return campaignList;
  }
}
