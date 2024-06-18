import { HideField, ObjectType } from '@nestjs/graphql';
import { Translation } from '@utils/utils.dto';

@ObjectType()
export class GoalCategory {
  id: string;
  title: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  @HideField()
  translations?: Translation;
  sequence_number: number;
}
