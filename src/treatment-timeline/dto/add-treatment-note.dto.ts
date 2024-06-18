import { i18nValidationMessage } from '@core/modules/i18n-next';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { TimelineAttachmentType } from '@treatment-timeline/entities/treatment-timeline-attachment.entity';
import { FileType } from '@uploads/upload.dto';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  ValidateIf,
} from 'class-validator';

@InputType()
export class AddTreatmentNoteInput {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field(() => String)
  title: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field(() => String)
  description: string;

  @IsEnum(FileType, { message: i18nValidationMessage('is_enum') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @Field(() => FileType, {
    nullable: true,
    description: `File Type must be ${Object.values(FileType)}`,
  })
  file_type: FileType;

  @Field(() => String, { nullable: true })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @ValidateIf((obj: AddTreatmentNoteInput) => {
    const { file_type } = obj;
    return (
      file_type === FileType.DOCUMENT ||
      file_type === FileType.IMAGE ||
      file_type === FileType.VIDEO
    );
  })
  @IsUrl({}, { message: i18nValidationMessage('is_url') })
  file_url: string;

  @Field(() => String, { nullable: true })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @ValidateIf((obj: AddTreatmentNoteInput) => {
    const { file_type } = obj;
    return (
      file_type === FileType.DOCUMENT ||
      file_type === FileType.IMAGE ||
      file_type === FileType.VIDEO
    );
  })
  file_id: string;

  @Field(() => String, { nullable: true })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @ValidateIf((obj: AddTreatmentNoteInput) => {
    const { file_type } = obj;
    return (
      file_type === FileType.DOCUMENT ||
      file_type === FileType.IMAGE ||
      file_type === FileType.VIDEO
    );
  })
  file_path: string;

  @Field(() => String, { nullable: true })
  @ValidateIf((obj: AddTreatmentNoteInput) => obj.file_type === FileType.VIDEO)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  thumbnail_image_id: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUrl({}, { message: i18nValidationMessage('is_url') })
  @Field(() => String, { nullable: true })
  @ValidateIf((obj: AddTreatmentNoteInput) => obj.file_type === FileType.VIDEO)
  thumbnail_image_url: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field(() => String, { nullable: true })
  @ValidateIf((obj: AddTreatmentNoteInput) => obj.file_type === FileType.VIDEO)
  thumbnail_image_path: string;
}

@ObjectType()
export class AddTreatmentNoteResponse {
  @Field(() => String)
  message: string;
}

export class InsertTreatmentNoteInput extends AddTreatmentNoteInput {
  id: string;
  created_by: string;
  type: TimelineAttachmentType;
}
