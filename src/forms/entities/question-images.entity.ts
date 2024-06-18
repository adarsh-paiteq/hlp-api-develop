import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class QuestionImage {
  id: string;
  form: string;
  page: string;
  question: string;
  image_url: string;
  image_id: string;
  file_path: string;
  created_at: string;
  updated_at: string;
}
