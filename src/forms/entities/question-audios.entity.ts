import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class QuestionAudio {
  id: string;
  form: string;
  page: string;
  question: string;
  audio_url: string;
  audio_id: string;
  audio_file_path: string;
  created_at: string;
  updated_at: string;
}
