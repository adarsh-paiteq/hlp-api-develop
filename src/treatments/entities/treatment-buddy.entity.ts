import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TreatmentBuddy {
  id: string;
  treatment_id: string;
  user_id: string;
  is_deleted: boolean;
  created_by: string;
  updated_by: string;
  @Field(() => GraphQLISODateTime)
  created_at: string;
  @Field(() => GraphQLISODateTime)
  updated_at: string;
}
