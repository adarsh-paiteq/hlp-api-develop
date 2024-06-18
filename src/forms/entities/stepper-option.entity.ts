import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { GraphQLInt } from 'graphql';

export enum StepperOptionOperationType {
  INCREMENT = 'INCREMENT',
  DECREMENT = 'DECREMENT',
}

registerEnumType(StepperOptionOperationType, {
  name: 'StepperOptionOperationType',
});

@ObjectType()
export class StepperOption {
  id: string;
  page: string;
  question: string;
  @Field(() => GraphQLInt, { nullable: true })
  points?: number;
  emoji: string;
  operation_type?: StepperOptionOperationType;
  created_at: string;
  updated_at: string;
  form: string;
}
