import {
  StageMessageFrequency,
  StageMessages,
} from '@treatment-timeline/entities/stage-messages.entity';
import { TreatmentUserDTO } from './add-treatment-file.dto';
import { StageType } from '@treatment-timeline/entities/stage.entity';
import { Allow, IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { i18nValidationMessage } from '@core/modules/i18n-next';
import { Treatment } from '@treatments/entities/treatments.entity';
import { TreatmentRoles } from '@treatments/dto/add-treatment.dto';

export class TreatmentWithUserDTO extends TreatmentUserDTO {
  user_id: string;
}

interface FrequencyMapping {
  [key: string]: { [key: string]: number };
}

export const frequencyDurations: FrequencyMapping = {
  [StageMessageFrequency.AT_BEGINNING]: { days: 0 },
  [StageMessageFrequency.AFTER_1_DAY]: { days: 1 },
  [StageMessageFrequency.AFTER_2_DAY]: { days: 2 },
  [StageMessageFrequency.AFTER_3_DAY]: { days: 3 },
  [StageMessageFrequency.AFTER_1_WEEK]: { weeks: 1 },
  [StageMessageFrequency.AFTER_1_MONTH]: { months: 1 },
  [StageMessageFrequency.AFTER_3_MONTH]: { months: 3 },
};

export class DefaultTimelineMessageData {
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  treatmentId: string;

  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  userId: string;

  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  doctorId: string;

  @IsEnum(StageType, { message: i18nValidationMessage('is_enum') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  stageType: StageType;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  stageId?: string;

  @IsEnum(StageMessageFrequency, { message: i18nValidationMessage('is_enum') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  frequency?: StageMessageFrequency;

  @Allow()
  frequencyStageMessages?: StageMessages[];

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  stageMessageId?: string;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  scheduleId?: string;
}

export class RemoveDelayedJobsByStageBody {
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  stageId: string;
}

export class TreatmentWithDoctorRole extends Treatment {
  doctor_role: TreatmentRoles;
  doctor_id: string;
}
