import { Field, HideField, Int, ObjectType, PickType } from '@nestjs/graphql';
import { Campaign } from '../entities/campaign.entity';
import { Translation } from '@utils/utils.dto';

@ObjectType()
export class CampaignListResponse {
  @Field(() => [Campaigns], { nullable: 'items' })
  campaigns: Campaigns[];
  @Field(() => [Campaigns], { nullable: 'itemsAndList' })
  previous_campaigns: Campaigns[];
}

@ObjectType()
export class Campaigns extends PickType(Campaign, [
  'id',
  'title',
  'short_description',
  'image_id',
  'image_url',
  'file_path',
  'campaign_goal',
  'is_campaign_goal_fulfilled',
]) {
  @Field(() => Int)
  total_hlp_points_donated: number;
  @HideField()
  translations?: Translation;
}
