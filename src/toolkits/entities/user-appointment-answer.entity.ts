import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserAppointmentAnswer {
  id: string;
  user_id: string;
  schedule_id: string;
  appointment_id: string;
  hlp_points_earned: number;
  session_id: string;
  session_date: string;
  @Field(() => GraphQLISODateTime)
  created_at: Date;
  @Field(() => GraphQLISODateTime)
  updated_at: Date;
  feeling?: number;
  session_time: string;
  note?: string;
  note_image_id?: string;
  note_image_file_path?: string;
  note_image_url?: string;
}
