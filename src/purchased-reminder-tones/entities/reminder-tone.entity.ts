import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ReminderTone {
  hlp_points_needed_to_purchase_this_tone: number;
  audio_url: string;
  @Field(() => String, { nullable: true })
  file_name: string;
  file_path: string;
  image_id: string;
  image_url: string;
  short_description: string;
  title: string;
  created_at: string;
  updated_at: string;
  id: string;
  membership_stage_id?: string;
}
