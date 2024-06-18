import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DoctorSpecialities {
  id: string;
  doctor_id: string;
  speciality_id: string;
  @Field(() => GraphQLISODateTime)
  updated_at: Date;
  @Field(() => GraphQLISODateTime)
  created_at: Date;
}
