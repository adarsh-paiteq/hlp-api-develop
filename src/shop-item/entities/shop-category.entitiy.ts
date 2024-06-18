import { ObjectType, Field, HideField } from '@nestjs/graphql';
import { Translation } from '@utils/utils.dto';

@ObjectType()
export class ShopCategory {
  @Field()
  description: string;
  @Field()
  title: string;
  @Field()
  created_at: string;
  @Field()
  updated_at: string;
  @Field()
  id: string;
  @HideField()
  translations?: Translation;
}
