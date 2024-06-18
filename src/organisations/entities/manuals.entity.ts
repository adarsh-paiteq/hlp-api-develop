import { HideField, ObjectType } from '@nestjs/graphql';
import { Translation } from '@utils/utils.dto';

@ObjectType()
export class Manual {
  id: string;
  title: string;
  question: string;
  answer: string;
  @HideField()
  organisations: string[];
  created_at: Date;
  updated_at: Date;
  @HideField()
  translations?: Translation;
}
