import { Field, ObjectType } from '@nestjs/graphql';
import { Doctor } from '../entities/doctors.entity';

@ObjectType()
export class GetDoctorsResponse {
  @Field(() => [Doctor], { nullable: true })
  doctors: Doctor[];
}
