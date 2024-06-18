import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { StageTranslation } from '../dto/get-stage.dto';

@ObjectType()
export class StageMessages {
  id: string;
  stage_id: string;
  frequency?: StageMessageFrequency;
  toolkit_id?: string;
  sort_order?: number;
  is_deleted: boolean;
  updated_by: string;
  created_by: string;
  @Field(() => String)
  created_at: Date;
  @Field(() => String)
  updated_at: Date;
  translations: StageTranslation;
}

export enum StageMessageFrequency {
  AT_BEGINNING = 'AT_BEGINNING',
  AFTER_1_DAY = 'AFTER_1_DAY',
  AFTER_2_DAY = 'AFTER_2_DAY',
  AFTER_3_DAY = 'AFTER_3_DAY',
  AFTER_1_WEEK = 'AFTER_1_WEEK',
  AFTER_1_MONTH = 'AFTER_1_MONTH',
  AFTER_3_MONTH = 'AFTER_3_MONTH',
}

registerEnumType(StageMessageFrequency, { name: 'StageMessageFrequency' });
