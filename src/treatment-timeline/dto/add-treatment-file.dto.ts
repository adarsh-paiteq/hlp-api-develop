import { i18nValidationMessage } from '@core/modules/i18n-next';
import { Field, InputType, ObjectType, OmitType } from '@nestjs/graphql';
import { StageMessages } from '@treatment-timeline/entities/stage-messages.entity';
import { Stage } from '@treatment-timeline/entities/stage.entity';
import { TimelineAttachmentType } from '@treatment-timeline/entities/treatment-timeline-attachment.entity';
import { TreatmentTimeline } from '@treatment-timeline/entities/treatment-timeline.entity';
import { FileType } from '@uploads/upload.dto';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUrl,
  ValidateIf,
} from 'class-validator';

@InputType()
export class AddTreatmentFileInput {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field(() => String)
  title: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field(() => String)
  description: string;

  @IsEnum(FileType, { message: i18nValidationMessage('is_enum') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field(() => FileType, {
    nullable: false,
    description: `File Type must be ${Object.values(FileType)}`,
  })
  file_type: FileType;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUrl({}, { message: i18nValidationMessage('is_url') })
  @Field(() => String)
  file_url: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field(() => String)
  file_id: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field(() => String)
  file_path: string;

  @Field(() => String, { nullable: true })
  @ValidateIf((obj: AddTreatmentFileInput) => obj.file_type === FileType.VIDEO)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  thumbnail_image_id: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUrl({}, { message: i18nValidationMessage('is_url') })
  @Field(() => String, { nullable: true })
  @ValidateIf((obj: AddTreatmentFileInput) => obj.file_type === FileType.VIDEO)
  thumbnail_image_url: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field(() => String, { nullable: true })
  @ValidateIf((obj: AddTreatmentFileInput) => obj.file_type === FileType.VIDEO)
  thumbnail_image_path: string;
}

@ObjectType()
export class AddTreatmentFileResponse {
  @Field(() => String)
  message: string;
}

export class InsertTreatmentFileInput extends AddTreatmentFileInput {
  id: string;
  created_by: string;
  type: TimelineAttachmentType;
}

export class TreatmentUserDTO {
  organization_id: string;
  treatment_option_id: string;
  age_group: string;
  treatment_id: string;
  treatment_start_date: Date;
}

export class StageWithStageMessageDTO extends Stage {
  @Field(() => [StageMessages], { nullable: false })
  stage_messages: StageMessages[];
}

export class InsertTreatmentTimeline extends OmitType(TreatmentTimeline, [
  'created_at',
  'updated_at',
]) {}
