import { Field, ObjectType } from '@nestjs/graphql';
import { GraphQLInt } from 'graphql';

@ObjectType()
export class VitalsToolkitAnswer {
  id: string;
  user_id: string;
  tool_kit_id: string;
  systolic_value: number;
  diastolic_value: number;
  @Field(() => GraphQLInt)
  pulse: number;
  weight: number;
  height: number;
  bmi: number;
  feeling?: number;
  note?: string;
  session_date: string;
  session_time: string;
  schedule_id: string;
  @Field(() => GraphQLInt)
  hlp_points_earned: number;
  session_id: string;
  challenge_id?: string;
  day_id?: string;
  note_image_id?: string;
  note_image_file_path?: string;
  note_image_url?: string;
  created_at: string;
  updated_at: string;
}
