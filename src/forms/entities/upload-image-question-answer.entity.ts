import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UploadImageQuestionAnswer {
  @Field(() => String)
  id: string;
  @Field(() => String)
  user_id: string;
  @Field(() => String)
  form_id: string;
  @Field(() => String)
  page_id: string;
  @Field(() => String)
  question_id: string;
  @Field(() => String)
  image_url: string;
  @Field(() => String)
  image_id: string;
  @Field(() => String)
  file_path: string;
  @Field(() => String)
  created_at: string;
  @Field(() => String)
  updated_at: string;
  @Field(() => String)
  session_date: string;
  @Field(() => String)
  session_time: string;
  @Field(() => String)
  schedule_id: string;
  @Field(() => String)
  session_id: string;
}
