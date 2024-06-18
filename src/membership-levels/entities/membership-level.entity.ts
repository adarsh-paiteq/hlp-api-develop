import { HideField, ObjectType } from '@nestjs/graphql';
import { Translation } from '@utils/utils.dto';

@ObjectType('MembershipLevelN')
export class MembershipLevel {
  hlp_reward_points: number;
  hlp_reward_points_to_complete_this_level: number;
  sequence_number: number;
  title: string;
  created_at: string;
  updated_at: string;
  id: string;
  description?: string;
  @HideField()
  translations?: Translation;
}
