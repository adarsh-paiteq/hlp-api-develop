import { Field, ObjectType } from '@nestjs/graphql';
import { TreatmentComplaint } from '@treatments/entities/treatment-complaints.entity';

@ObjectType()
export class GetTreatmentComplaintsListResponse {
  @Field(() => [TreatmentComplaint])
  treatmentComplaint: TreatmentComplaint[];
}
