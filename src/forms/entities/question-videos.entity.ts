import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class QuestionVideos {
  @Field(() => String, { nullable: true })
  video_id?: string;
  @Field(() => String, { nullable: true })
  video_path?: string;
  video_text: string;
  video_thumbnail: string;
  @Field(() => String, { nullable: true })
  video_thumbnail_id?: string;
  @Field(() => String, { nullable: true })
  video_thumbnail_path?: string;
  video_url: string;
  created_at: string;
  updated_at: string;
  form: string;
  id: string;
  page: string;
  question: string;
}
