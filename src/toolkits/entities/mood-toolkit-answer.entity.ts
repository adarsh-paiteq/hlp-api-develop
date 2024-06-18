import { Field, ObjectType } from '@nestjs/graphql';
import { GraphQLInt } from 'graphql';

@ObjectType()
export class MoodToolkitAnswer {
  mood_sub_categories: string[];
  session_date: string;
  @Field(() => GraphQLInt)
  hlp_points_earned?: number;
  note?: string;
  note_image_file_path?: string;
  note_image_id?: string;
  note_image_url?: string;
  created_at: Date;
  updated_at: Date;
  session_time: string;
  challenge_id?: string;
  day_id?: string;
  id: string;
  mood_category_id: string;
  schedule_id: string;
  session_id: string;
  tool_kit_id: string;
  user_id: string;
}
