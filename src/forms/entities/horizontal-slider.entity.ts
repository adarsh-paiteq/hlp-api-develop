import { Field, ObjectType } from '@nestjs/graphql';
import { GraphQLInt } from 'graphql';

@ObjectType()
export class HorizontalSlider {
  id: string;
  @Field(() => GraphQLInt)
  starting_value: number;
  @Field(() => GraphQLInt)
  maximum_value: number;
  form: string;
  page: string;
  question: string;
  created_at: string;
  updated_at: string;
  @Field(() => GraphQLInt, { nullable: true })
  points?: number;
}
