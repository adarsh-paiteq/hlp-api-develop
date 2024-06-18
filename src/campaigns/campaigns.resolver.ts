import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { LoggedInUser } from '../shared/auth/jwt.strategy';
import { Roles } from '../shared/decorators/roles.decorator';
import { GetUser } from '../shared/decorators/user.decorator';
import { JwtAuthGuard } from '../shared/guards/auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { UserRoles } from '../users/users.dto';
import { CampaignsService } from './campaigns.service';
import {
  GetCampaignArgs,
  GetCampaignDetailsResponse,
} from './dto/campaigns.dto';
import { DonateToCampaignArgs } from './dto/donate-to-campaign';
import { CampaignDonation } from './entities/campaign-donation.entity';
import { Campaign } from './entities/campaign.entity';
import { CampaignListResponse } from './dto/get-campaign-list.dto';
import { I18nNextLanguage } from '@shared/decorators/language.decorator';

@Resolver()
export class CampaignsResolver {
  constructor(private readonly campaignsService: CampaignsService) {}

  /**
   * @description it is used from app side.
   */
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => CampaignDonation)
  async DonateToCampaign(
    @GetUser() user: LoggedInUser,
    @Args() args: DonateToCampaignArgs,
  ): Promise<CampaignDonation> {
    return this.campaignsService.donateToCampaign(user.id, args);
  }

  /**
   * @deprecated it is not used from app side.
   */
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => Campaign, { name: 'getCampaign' })
  async getCampaign(@Args() args: GetCampaignArgs): Promise<Campaign> {
    return this.campaignsService.getCampaignById(args.campaignId);
  }

  /**
   * @description it is used from app side.
   */
  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => GetCampaignDetailsResponse, { name: 'getCampaignDetails' })
  async getCampaignDetails(
    @Args() args: GetCampaignArgs,
    @I18nNextLanguage() lang: string,
  ): Promise<GetCampaignDetailsResponse> {
    return this.campaignsService.getCampaignDetails(args.campaignId, lang);
  }

  @Roles(UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => CampaignListResponse, { name: 'getCampaigns' })
  async getCampaignList(
    @I18nNextLanguage() lang: string,
  ): Promise<CampaignListResponse> {
    return this.campaignsService.getCampaignList(lang);
  }
}
