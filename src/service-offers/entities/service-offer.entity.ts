import { HideField, ObjectType } from '@nestjs/graphql';
import { Translation } from '@utils/utils.dto';

@ObjectType()
export class ServiceOffer {
  show_offer_in_dashboard: boolean;
  hlp_points_needed_to_redeem_offer: number;
  description: string;
  extra_information_description: string;
  extra_information_title: string;
  file_path: string;
  image_id: string;
  image_url: string;
  offer_label: string;
  offer_link: string;
  offer_type: string;
  short_description: string;
  title: string;
  created_at: string;
  updated_at: string;
  id: string;
  service_id: string;
  offer_price?: number;
  @HideField()
  translations?: Translation;
}
