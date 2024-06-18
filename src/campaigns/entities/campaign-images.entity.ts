import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CompaignImages {
  id: string;
  campaign_id: string;
  image_url: string;
  image_id: string;
  file_path: string;
  created_at: string;
  updated_at: string;
}
