import { i18nValidationMessage } from '@core/modules/i18n-next';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import {
  IsBoolean,
  IsNotEmpty,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { AddTreatmentNoteInput } from './add-treatment-note.dto';
import { Type } from 'class-transformer';

@InputType()
export class UpdateTreatmentTimelineNote extends AddTreatmentNoteInput {
  @Field(() => Boolean, { nullable: false })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  is_private_note: boolean;
}

@InputType()
export class UpdateTreatmentTimelineNoteInput {
  @Field()
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsString({ message: i18nValidationMessage('is_string') })
  treatment_timeline_id: string;

  @IsObject({ message: i18nValidationMessage('is_object') })
  @Type(() => UpdateTreatmentTimelineNote)
  @Field(() => UpdateTreatmentTimelineNote)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  treatment_timeline_note: UpdateTreatmentTimelineNote;
}

@ObjectType()
export class UpdateTreatmentTimelineNoteResponse {
  @Field(() => String)
  message: string;
}
