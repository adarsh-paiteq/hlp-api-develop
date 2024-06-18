import { ArgsType, Field, Int, ObjectType } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';
import { CompaignImages } from '../entities/campaign-images.entity';
import { Campaign } from '../entities/campaign.entity';
import { i18nValidationMessage } from '@core/modules/i18n-next';

@ArgsType()
export class GetCampaignArgs {
  @Field()
  @IsUUID(undefined, { message: i18nValidationMessage('is_uuid') })
  campaignId: string;
}
@ObjectType()
export class GetCampaignDetailsResponse extends Campaign {
  @Field(() => [CompaignImages], { nullable: 'items' })
  campaign_images: CompaignImages[];
  @Field(() => Int)
  total_reward_points_donated: number;
}
