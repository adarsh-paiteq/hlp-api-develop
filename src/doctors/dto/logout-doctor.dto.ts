import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class LogoutDoctorResponse {
  @Field(() => String)
  message: string;
}
