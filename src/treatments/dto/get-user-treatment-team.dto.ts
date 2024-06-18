import { ObjectType } from '@nestjs/graphql';
import { GetTreatmentTeamResponse } from './get-treatment-team.dto';

@ObjectType()
export class GetUserTreatmentTeamResponse extends GetTreatmentTeamResponse {}
