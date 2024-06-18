import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

@ObjectType()
export class Stage {
  @Field(() => String)
  created_at: Date;
  @Field(() => String)
  updated_at: Date;
  id: string;
  organisation_id: string;
  treatment_option_id?: string | null;
  age_group?: string[] | null;
  stage_type: StageType;
  image_url: string;
  image_id: string;
  file_path: string;
  is_active: boolean;
  is_deleted: boolean;
  updated_by: string;
  created_by: string;
}

export enum StageType {
  FORMS = 'FORMS',
  GROUP = 'GROUP',
  TOOL_KIT = 'TOOL_KIT',
  COACHES = 'COACHES',
  BUDDY = 'BUDDY',
  DEFAULT = 'DEFAULT',
  EXPERIENCE_EXPERT = 'EXPERIENCE_EXPERT',
  SLEEP_CHECK = 'SLEEP_CHECK',
  NOTE = 'NOTE',
  FILE = 'FILE',
  ACTIVITY = 'ACTIVITY',
  INTAKE_APPOINTMENT = 'INTAKE_APPOINTMENT',
  RESEARCH_APPOINTMENT = 'RESEARCH_APPOINTMENT',
  OTHER_APPOINTMENT = 'OTHER_APPOINTMENT',
}

registerEnumType(StageType, { name: 'StageType' });
