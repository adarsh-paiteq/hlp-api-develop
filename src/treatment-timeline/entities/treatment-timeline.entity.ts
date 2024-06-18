import { Field, ObjectType } from '@nestjs/graphql';
import { StageType } from './stage.entity';

@ObjectType()
export class TreatmentTimeline {
  id: string;
  user_id: string;
  schedule_id?: string;
  stage_message_id: string;
  stage_type: StageType;
  treatment_id?: string;
  treatment_team_member_id?: string;
  treatment_doctor_role?: string;
  attachment_id?: string;
  @Field(() => String)
  created_at: Date;
  @Field(() => String)
  updated_at: Date;
}
