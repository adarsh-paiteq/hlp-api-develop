import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class QuoteImage {
  id: string;
  image_id: string;
  image_url: string;
  file_path: string;
  quote_id: string;
}
