import { Field, GraphQLISODateTime, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLInt } from 'graphql';

@ObjectType()
export class AddictionLogToolkitAnswer {
  id: string;
  user_id: string;
  tool_kit_id: string;
  @Field(() => Boolean, {
    description: `It will be used to store the value for thumbs up or thumbs down`,
  })
  addiction_log_answer: boolean;
  @Field(() => Int)
  days_without_addiction: number;
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
  @Field(() => GraphQLISODateTime)
  created_at: string;
  @Field(() => GraphQLISODateTime)
  updated_at: string;
}
