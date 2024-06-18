import { Field, ObjectType } from '@nestjs/graphql';
import { GraphQLInt } from 'graphql';

@ObjectType()
export class CircularSlider {
  @Field(() => GraphQLInt)
  maximum_angle: number;
  @Field(() => GraphQLInt, { nullable: true })
  points?: number;
  @Field(() => GraphQLInt)
  starting_angle: number;
  created_at: string;
  updated_at: string;
  form: string;
  id: string;
  page: string;
  question: string;
}
