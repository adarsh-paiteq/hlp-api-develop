import { Field, ObjectType } from '@nestjs/graphql';
import { GraphQLInt } from 'graphql';

@ObjectType()
export class NumberSelectOption {
  id: string;
  answer: number;
  form: string;
  page: string;
  question: string;
  created_at: string;
  updated_at: string;
  @Field(() => GraphQLInt, { nullable: true })
  points?: number;
}
