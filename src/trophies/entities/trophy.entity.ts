import { HideField, ObjectType } from '@nestjs/graphql';
import { Translation } from '@utils/utils.dto';

@ObjectType()
export class Trophy {
  account_duration_in_years?: number;
  challenges_done?: number;
  challenges_won?: number;
  channels_follow?: number;
  check_ins_done?: number;
  friends_follow?: number;
  hlp_reward_points: number;
  hlps_donated?: number;
  hlps_received: number;
  hlps_won?: number;
  meditations_done?: number;
  no_of_donations?: number;
  no_of_goals_done?: number;
  no_of_levels_done?: number;
  posts_added?: number;
  reactions_added?: number;
  streaks?: number;
  tools_done?: number;
  file_path: string;
  image_id: string;
  image_url: string;
  short_description: string;
  title: string;
  trophy_type: string;
  created_at: string;
  updated_at: string;
  id: string;
  @HideField()
  translations?: Translation;
}
