import { HideField, ObjectType } from '@nestjs/graphql';
import { Translation } from '@utils/utils.dto';

@ObjectType()
export class SupportVideosCategory {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  @HideField()
  translations?: Translation;
}
