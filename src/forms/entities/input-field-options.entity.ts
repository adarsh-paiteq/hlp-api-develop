import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { GraphQLInt } from 'graphql';

export enum InputFieldType {
  NUMBER = 'NUMBER',
  TEXT = 'TEXT',
  FILE = 'FILE',
}

registerEnumType(InputFieldType, { name: 'InputFieldType' });

@ObjectType()
export class InputFieldOption {
  id: string;
  title: string;
  form: string;
  page: string;
  question: string;
  size: string;
  input_type: InputFieldType;
  created_at: string;
  updated_at: string;
  @Field(() => GraphQLInt, { nullable: true })
  points?: number;
  hint_text?: string;
}
