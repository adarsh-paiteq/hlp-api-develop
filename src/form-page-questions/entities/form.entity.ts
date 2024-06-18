import { HideField } from '@nestjs/graphql';
import { Translation } from '@utils/utils.dto';

export class Form {
  hlp_reward_points: number;
  description: string;
  title: string;
  created_at: string;
  updated_at: string;
  id: string;
  @HideField()
  translations?: Translation;
}
