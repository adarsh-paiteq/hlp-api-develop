import { Field, ObjectType } from '@nestjs/graphql';
import { GraphQLInt } from 'graphql';

@ObjectType()
export class AudioToolkitAnswer {
  id: string;
  user_id: string;
  tool_kit_id: string;
  audio_id: string;
  @Field(() => GraphQLInt)
  hlp_points_earned: number;
  note?: string;
  session_date: string;
  session_time: string;
  schedule_id: string;
  session_id?: string;
  challenge_id?: string;
  day_id?: string;
  feeling?: number;
  note_image_id?: string;
  note_image_file_path?: string;
  note_image_url?: string;
  duration?: string;
  consumed_duration?: string;
  created_at: string;
  updated_at: string;
}
