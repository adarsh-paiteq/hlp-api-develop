import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DoctorProfileVideo {
  id: string;
  doctor_id: string;
  video_url: string;
  video_path: string;
  video_id: string;
  thumbnail_image_url: string;
  thumbnail_image_id: string;
  thumbnail_image_id_path: string;
  @Field(() => GraphQLISODateTime)
  updated_at: Date;
  @Field(() => GraphQLISODateTime)
  created_at: Date;
  video_name?: string;
}
