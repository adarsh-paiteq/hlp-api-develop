import { Doctor } from '@doctors/entities/doctors.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GetDoctorAccountInfoResponse {
  @Field(() => Doctor)
  doctorAccountInfo: Doctor;
}
