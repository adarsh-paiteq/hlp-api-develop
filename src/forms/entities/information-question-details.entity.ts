import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class InformationQuestionDetail {
  id: string;
  title: string;
  description: string;
  form: string;
  page: string;
  question: string;
  created_at: string;
  updated_at: string;
}
