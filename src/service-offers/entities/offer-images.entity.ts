import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class OfferImage {
  file_path: string;
  image_id: string;
  image_url: string;
  created_at: string;
  updated_at: string;
  id: string;
  offer_id: string;
}
