import {
  Field,
  GraphQLISODateTime,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';

export enum SupportQuestionStatus {
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
}
registerEnumType(SupportQuestionStatus, { name: 'SupportQuestionStatus' });

@ObjectType()
export class SupportQuestions {
  id: string;
  doctor_id: string;
  title: string;
  description: string;
  status: SupportQuestionStatus;
  @Field(() => GraphQLISODateTime)
  created_at: string;
  @Field(() => GraphQLISODateTime)
  updated_at: string;
}
