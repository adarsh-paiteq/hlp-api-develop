import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TreatmentPatientComplaint {
  id: string;
  treatment_id: string;
  treatment_complaint_id: string;
  user_id: string;
  @Field(() => GraphQLISODateTime)
  created_at: string;
  @Field(() => GraphQLISODateTime)
  updated_at: string;
}
