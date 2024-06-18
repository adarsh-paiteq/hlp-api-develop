import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';
import { GraphQLInt } from 'graphql';

@ObjectType()
export class HyperActivitySymptomsLogToolkitAnswer {
  id: string;
  user_id: string;
  tool_kit_id: string;
  @Field(() => GraphQLInt)
  hyper_activity_symptom_level: number;
  hyper_activity_duration: string;
  feeling?: number;
  note?: string;
  session_date: string;
  session_time: string;
  schedule_id: string;
  @Field(() => GraphQLInt)
  hlp_points_earned?: number;
  session_id: string;
  challenge_id?: string;
  day_id?: string;
  note_image_id?: string;
  note_image_file_path?: string;
  note_image_url?: string;
  @Field(() => GraphQLISODateTime)
  created_at: string;
  @Field(() => GraphQLISODateTime)
  updated_at: string;
}
