import { Speciality } from '@doctors/entities/specialities.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GetSpecialitiesListResponse {
  @Field(() => [Speciality])
  specialities: Speciality[];
}
