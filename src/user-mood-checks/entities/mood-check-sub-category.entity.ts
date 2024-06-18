import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MoodCheckSubCategory {
  @Field(() => String)
  id: string;
  @Field(() => String)
  category_id: string;
  @Field(() => String)
  title: string;
  @Field(() => String)
  image_id: string;
  @Field(() => String)
  image_url: string;
  @Field(() => String)
  file_path: string;
  @Field(() => String)
  created_at: string;
  @Field(() => String)
  updated_at: string;
}
