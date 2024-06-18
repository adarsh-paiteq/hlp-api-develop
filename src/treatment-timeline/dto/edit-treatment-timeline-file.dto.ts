import { i18nValidationMessage } from '@core/modules/i18n-next';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AddTreatmentFileInput } from './add-treatment-file.dto';

@InputType()
export class UpdateTreatmentTimelineFile extends AddTreatmentFileInput {}

@InputType()
export class UpdateTreatmentTimelineFileInput {
  @Field()
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsString({ message: i18nValidationMessage('is_string') })
  treatment_timeline_id: string;

  @IsObject({ message: i18nValidationMessage('is_object') })
  @Type(() => UpdateTreatmentTimelineFile)
  @Field(() => UpdateTreatmentTimelineFile)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  treatment_timeline_file: UpdateTreatmentTimelineFile;
}

@ObjectType()
export class UpdateTreatmentTimelineFileResponse {
  @Field(() => String)
  message: string;
}
