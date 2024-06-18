import { Field, HideField, Int, ObjectType } from '@nestjs/graphql';
import { Translation } from '@utils/utils.dto';

@ObjectType()
export class Campaign {
  is_campaign_goal_fulfilled?: boolean;
  @Field(() => Int)
  campaign_goal: number;
  description: string;
  emoji: string;
  file_path: string;
  image_id: string;
  image_url: string;
  link_url: string;
  short_description: string;
  sub_name: string;
  sub_title: string;
  title: string;
  created_at: string;
  updated_at: string;
  id: string;
  @Field(() => String, { nullable: true })
  extra_information_title: string;
  @Field(() => String, { nullable: true })
  extra_information_description: string;
  @HideField()
  translations?: Translation;
}
