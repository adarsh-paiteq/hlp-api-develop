import { HideField, ObjectType } from '@nestjs/graphql';
import { Translation } from '@utils/utils.dto';

@ObjectType()
export class FaqCategory {
  id: string;
  title: string;
  @HideField()
  organisations?: string[];
  created_at: string;
  updated_at: string;
  @HideField()
  translations?: Translation;
}
