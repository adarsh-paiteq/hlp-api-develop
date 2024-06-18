import {
  Field,
  GraphQLISODateTime,
  HideField,
  ObjectType,
} from '@nestjs/graphql';
import { Translation } from '@utils/utils.dto';

@ObjectType()
export class AboutUs {
  id: string;
  image_url: string;
  image_id: string;
  file_path: string;
  description: string;
  @Field(() => GraphQLISODateTime)
  created_at: string;
  @Field(() => GraphQLISODateTime)
  updated_at: string;
  @HideField()
  translations?: Translation;
}
