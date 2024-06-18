import { HideField, ObjectType } from '@nestjs/graphql';
import { Translation } from '@utils/utils.dto';

@ObjectType('MembershipStageN')
export class MembershipStage {
  account_duration: number;
  hlp_reward_points: number;
  hlp_reward_points_to_unlock_this_stage: number;
  number_of_donations: number;
  sequence_number: number;
  color_code: string;
  description: string;
  emoji: string;
  title: string;
  created_at: string;
  updated_at: string;
  id: string;
  membership_level_id: string;
  emoji_image_url?: string;
  emoji_image_file_path?: string;
  emoji_image_id?: string;
  text_color?: string;
  @HideField()
  translations?: Translation;
}
