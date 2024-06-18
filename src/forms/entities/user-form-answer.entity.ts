import { Field, ObjectType } from '@nestjs/graphql';
import { GraphQLInt } from 'graphql';

@ObjectType()
export class UserFormAnswer {
  id: string;
  user_id: string;
  form_id: string;
  session_date: string;
  session_time: string;
  created_at: string;
  updated_at: string;
  @Field(() => String, { nullable: true })
  tool_kit_id?: string;
  @Field(() => String, { nullable: true })
  episode_id?: string;
  @Field(() => GraphQLInt, { nullable: true })
  hlp_points_earned: number;
  schedule_id: string;
  session_id: string;
  @Field(() => String, { nullable: true })
  challenge_id?: string;
  @Field(() => String, { nullable: true })
  day_id?: string;
  @Field(() => String, { nullable: true })
  note?: string;
  @Field(() => String, { nullable: true })
  note_image_id?: string;
  @Field(() => String, { nullable: true })
  note_image_file_path?: string;
  @Field(() => String, { nullable: true })
  note_image_url?: string;
  @Field(() => String, { nullable: true })
  episode_session_id?: string;
  @Field(() => String, { nullable: true })
  appointment_session_id?: string;
  @Field(() => String, { nullable: true })
  user_appointment_id?: string;
}
