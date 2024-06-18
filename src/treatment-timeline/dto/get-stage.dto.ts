import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { Stage } from '../entities/stage.entity';
import {
  StageMessageFrequency,
  StageMessages,
} from '../entities/stage-messages.entity';
import { Organisation } from '@organisations/entities/organisations.entity';
import { TreatmentOption } from '@treatments/entities/treatment-options.entity';

@ArgsType()
export class GetStageArgs {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field(() => String)
  stageId: string;
}

@ObjectType()
class StageMessageTranslation {
  @Field(() => String)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsString({ message: i18nValidationMessage('is_string') })
  message: string;
}

@ObjectType()
export class StageTranslation {
  @Field(() => StageMessageTranslation)
  en: StageMessageTranslation;

  @Field(() => StageMessageTranslation)
  nl: StageMessageTranslation;
}

@ObjectType()
export class StageDetail extends Stage {
  @Field(() => String, { nullable: true })
  treatment_option_name?: string;

  @Field(() => String)
  organisation_name: string;

  @Field(() => [StageMessages])
  stage_messages: StageMessages[];
}

@ObjectType()
export class GetStageResponse {
  @Field(() => StageDetail)
  stageDetail: StageDetail;
}

export class StageWithStageMessagesDTO extends Stage {
  organisations: Organisation;
  treatment_options?: TreatmentOption;
  stage_messages: StageMessages[];
}

export const frequencyOrder = new Map<StageMessageFrequency, number>([
  [StageMessageFrequency.AT_BEGINNING, 1],
  [StageMessageFrequency.AFTER_1_DAY, 2],
  [StageMessageFrequency.AFTER_2_DAY, 3],
  [StageMessageFrequency.AFTER_3_DAY, 4],
  [StageMessageFrequency.AFTER_1_WEEK, 5],
  [StageMessageFrequency.AFTER_1_MONTH, 6],
  [StageMessageFrequency.AFTER_3_MONTH, 7],
]);
