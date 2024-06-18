import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class OrderListInfoOption {
  id: string;
  form: string;
  page: string;
  question: string;
  title: string;
  created_at: string;
  updated_at: string;
}
