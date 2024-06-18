import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { GraphQLInt } from 'graphql';

export enum ValidationType {
  MANDATORY_FIELD = 'MANDATORY_FIELD',
  MIN_LENGTH = 'MIN_LENGTH',
  MAX_LENGTH = 'MAX_LENGTH',
  MIN = 'MIN',
  MAX = 'MAX',
  EMAIL = 'EMAIL',
  URL = 'URL',
  REGULAR_EXPRESSION = 'REGULAR_EXPRESSION',
  MIN_SELECTION = 'MIN_SELECTION',
  MAX_SELECTION = 'MAX_SELECTION',
}

registerEnumType(ValidationType, { name: 'ValidationType' });
@ObjectType()
export class QuestionValidation {
  id: string;
  question: string;
  validation_type: ValidationType;
  @Field(() => GraphQLInt, { nullable: true })
  min_text_length?: number;
  @Field(() => GraphQLInt, { nullable: true })
  max_text_length?: number;
  @Field(() => GraphQLInt, { nullable: true })
  min_number_value?: number;
  @Field(() => GraphQLInt, { nullable: true })
  max_number_value?: number;
  @Field(() => String, { nullable: true })
  regular_expression?: string;
  error_message: string;
  created_at: string;
  updated_at: string;
  @Field(() => GraphQLInt, { nullable: true })
  min_option_selection?: number;
  @Field(() => GraphQLInt, { nullable: true })
  max_option_selection?: number;
}
