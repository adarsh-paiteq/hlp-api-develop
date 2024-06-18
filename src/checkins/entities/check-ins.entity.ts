import { HideField, ObjectType } from '@nestjs/graphql';
import { Translation } from '@utils/utils.dto';

@ObjectType('CheckinN')
export class Checkin {
  id: string;
  title: string;
  description: string;
  avatar: string;
  hlp_reward_points: number;
  created_at: string;
  updated_at: string;
  tool_kit_id: string;
  emoji_image_url: string;
  emoji_image_id: string;
  emoji_image_file_path: string;
  @HideField()
  translations?: Translation;
}
