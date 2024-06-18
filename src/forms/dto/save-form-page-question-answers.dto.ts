import { Field, InputType, ObjectType, OmitType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { AudioQuestionAnswer } from '../entities/audio-question-answer.entity';
import { CircularSliderQuestionAnswer } from '../entities/circular-slider-question-answer.entity';
import { CustomInputFieldsQuestionAnswer } from '../entities/custom-input-fields-question-answer.entity';
import { DatePickerInputQuestionAnswer } from '../entities/date-picker-input-question-answer.entity';
import { DrawInputQuestionAnswer } from '../entities/draw-input-question-answer.entity';
import { QuestionType } from '../entities/form-page-question.entity';
import { HorizontalRadioButtonsQuestionAnswer } from '../entities/horizontal-radio-buttons-question-answer.entity';
import { HorizontalSlidersQuestionAnswer } from '../entities/horizontal-slider-question-answer.entity';
import { MoodSelectionQuestionAnswer } from '../entities/mood-selection-question-answer.entity';
import { MultipleAnswersQuestionAnswer } from '../entities/multiple-answers-question-answer.entity';
import { MultipleSelectButtonsQuestionAnswer } from '../entities/multiple-select-buttons-question-answer.entity';
import { MultipleSelectCheckBoxQuestionAnswer } from '../entities/multiple-select-checkbox-question-answer.entity';
import { MultipleSwitchesSelectionQuestionAnswer } from '../entities/multiple-switches-selection-question-answer.entity';
import { NumberSelectQuestionAnswer } from '../entities/number-select-question-answer.entity';
import { RadioWithImageQuestionAnswer } from '../entities/radio-with-image-question-answer.entity';
import { RangeImageTextQuestionAnswer } from '../entities/range-image-text-question-answer';
import { SingleSelectButtonsQuestionAnswer } from '../entities/single-select-buttons-question-answer.entity';
import { SingleSelectDropdownQuestionAnswer } from '../entities/single-select-dropdown-question-answer.entity';
import { SingleSelectQuestionAnswer } from '../entities/single-select-question-answer';
import { StepperQuestionAnswer } from '../entities/stepper-question-answer.entity';
import { TextBoxInputQuestionAnswer } from '../entities/text-box-input-question-answer.entity';
import { TextInputQuestionAnswer } from '../entities/text-input-question-answer.entity';
import { TimePickerQuestionAnswer } from '../entities/time-picker-question-answer.entity';
import { UploadImageQuestionAnswer } from '../entities/upload-image-question-answer.entity';
import { VerticalRadioQuestionAnswer } from '../entities/vertical-radio-question-answer.entity';
import { YesOrNoQuestionAnswer } from '../entities/yes-or-no-question-answer.entity';
import { YesOrNoWithImageQuestionAnswer } from '../entities/yes-or-no-with-image-question-answer.entity';
import { NumberInputQuestionAnswer } from '../entities/number-input-question-answer.entity';
import { i18nValidationMessage } from '@core/modules/i18n-next';

export type FormQuestionAnswers =
  | AudioQuestionAnswer
  | CircularSliderQuestionAnswer
  | CustomInputFieldsQuestionAnswer
  | DatePickerInputQuestionAnswer
  | DrawInputQuestionAnswer
  | HorizontalRadioButtonsQuestionAnswer
  | HorizontalSlidersQuestionAnswer
  | MoodSelectionQuestionAnswer
  | MultipleAnswersQuestionAnswer
  | MultipleSelectButtonsQuestionAnswer
  | MultipleSelectCheckBoxQuestionAnswer
  | MultipleSwitchesSelectionQuestionAnswer
  | NumberInputQuestionAnswer
  | NumberSelectQuestionAnswer
  | RadioWithImageQuestionAnswer
  | RangeImageTextQuestionAnswer
  | SingleSelectButtonsQuestionAnswer
  | SingleSelectDropdownQuestionAnswer
  | SingleSelectQuestionAnswer
  | StepperQuestionAnswer
  | TextBoxInputQuestionAnswer
  | TextInputQuestionAnswer
  | TimePickerQuestionAnswer
  | UploadImageQuestionAnswer
  | VerticalRadioQuestionAnswer
  | YesOrNoQuestionAnswer
  | YesOrNoWithImageQuestionAnswer;

@InputType()
export class BaseQuestionAnswerInput {
  @IsEnum(QuestionType, { message: i18nValidationMessage('is_enum') })
  @Field(() => QuestionType, {
    nullable: false,
    description: `QuestionType must be ${Object.values(QuestionType)}`,
  })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  question_type: QuestionType;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  question_id: string;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  answer: string;
}

@InputType()
export class AudioQuestionAnswerInput extends OmitType(
  BaseQuestionAnswerInput,
  ['answer'],
) {
  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  answer: string;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  duration: string;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  consumed_duration: string;
}

@InputType()
export class CircularSliderQuestionAnswerInput extends OmitType(
  BaseQuestionAnswerInput,
  ['answer'],
) {
  @Field(() => Number)
  @IsNumber({}, { message: i18nValidationMessage('is_number') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  answer: number;
}

@InputType()
export class CustomInputFieldsQuestionAnswerInput extends BaseQuestionAnswerInput {
  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  option_id: string;
}

@InputType()
export class DatePickerInputQuestionAnswerInput extends BaseQuestionAnswerInput {}

@InputType()
export class DrawInputQuestionAnswerInput extends BaseQuestionAnswerInput {}

@InputType()
export class HorizontalRadioButtonsQuestionAnswerInput extends OmitType(
  BaseQuestionAnswerInput,
  ['answer'],
) {
  @Field(() => String, { nullable: true })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  answer?: string;
}

@InputType()
export class HorizontalSlidersQuestionAnswerInput extends OmitType(
  BaseQuestionAnswerInput,
  ['answer'],
) {
  @Field(() => Number)
  @IsNumber({}, { message: i18nValidationMessage('is_number') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  answer: number;
}

@InputType()
export class MoodSelectionQuestionAnswerInput extends OmitType(
  BaseQuestionAnswerInput,
  ['answer'],
) {
  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  answer: string;
}
@InputType()
export class MultipleAnswersQuestionAnswerInput extends BaseQuestionAnswerInput {}

@InputType()
export class MultipleSelectButtonsQuestionAnswerInput extends OmitType(
  BaseQuestionAnswerInput,
  ['answer'],
) {
  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  answer: string;
}

@InputType()
export class MultipleSelectCheckBoxQuestionAnswerInput extends OmitType(
  BaseQuestionAnswerInput,
  ['answer'],
) {
  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  answer: string;
}

@InputType()
export class MultipleSwitchesSelectionQuestionAnswerInput extends OmitType(
  BaseQuestionAnswerInput,
  ['answer'],
) {
  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  answer: string;
}

@InputType()
export class NumberInputQuestionAnswerInput extends OmitType(
  BaseQuestionAnswerInput,
  ['answer'],
) {
  @Field(() => Number)
  @IsNumber({}, { message: i18nValidationMessage('is_number') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  answer: number;
}

@InputType()
export class NumberSelectQuestionAnswerInput extends OmitType(
  BaseQuestionAnswerInput,
  ['answer'],
) {
  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  answer: string;
}

@InputType()
export class RadioWithImageQuestionAnswerInput extends OmitType(
  BaseQuestionAnswerInput,
  ['answer'],
) {
  @Field(() => String)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  answer: string;
}

@InputType()
export class RangeImageTextQuestionAnswerInput extends OmitType(
  BaseQuestionAnswerInput,
  ['answer'],
) {
  @Field(() => String)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  answer: string;

  @Field(() => String)
  @IsUrl({}, { message: i18nValidationMessage('is_url') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  image_url: string;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  image_id: string;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  file_path: string;
}

@InputType()
export class SingleSelectButtonsQuestionAnswerInput extends OmitType(
  BaseQuestionAnswerInput,
  ['answer'],
) {
  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  answer: string;
}

@InputType()
export class SingleSelectDropdownQuestionAnswerInput extends OmitType(
  BaseQuestionAnswerInput,
  ['answer'],
) {
  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  answer: string;
}

@InputType()
export class SingleSelectQuestionAnswerInput extends OmitType(
  BaseQuestionAnswerInput,
  ['answer'],
) {
  @Field(() => String)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  answer: string;
}

@InputType()
export class StepperQuestionAnswerInput extends OmitType(
  BaseQuestionAnswerInput,
  ['answer'],
) {
  @Field(() => Number)
  @IsNumber({}, { message: i18nValidationMessage('is_number') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  answer: number;
}

@InputType()
export class TextBoxInputQuestionAnswerInput extends BaseQuestionAnswerInput {}

@InputType()
export class TextInputQuestionAnswerInput extends BaseQuestionAnswerInput {}

@InputType()
export class TimePickerQuestionAnswerInput extends BaseQuestionAnswerInput {}

@InputType()
export class UploadImageQuestionAnswerInput extends OmitType(
  BaseQuestionAnswerInput,
  ['answer'],
) {
  @Field(() => String)
  @IsUrl({}, { message: i18nValidationMessage('is_url') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  image_url: string;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  image_id: string;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  file_path: string;
}

@InputType()
export class VerticalRadioQuestionAnswerInput extends OmitType(
  BaseQuestionAnswerInput,
  ['answer'],
) {
  @Field(() => String)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  answer: string;
}

@InputType()
export class YesOrNoQuestionAnswerInput extends OmitType(
  BaseQuestionAnswerInput,
  ['answer'],
) {
  @Field(() => String)
  @IsUUID('4', {
    message: i18nValidationMessage('invalid_uuid'),
  })
  @IsNotEmpty({ message: 'answer_reuired' })
  answer: string;
}

@InputType()
export class YesOrNoWithImageQuestionAnswerInput extends OmitType(
  BaseQuestionAnswerInput,
  ['answer'],
) {
  @Field(() => String)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  answer: string;
}

export class SaveAudioQuestionAnswer extends AudioQuestionAnswerInput {
  @Field(() => String)
  user_id: string;

  @Field(() => String)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  form_id: string;

  @Field(() => String)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  page_id: string;

  @Field(() => String)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  schedule_id: string;

  @Field(() => String)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  session_id: string;

  @Field(() => String)
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_date: string;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_time: string;
}
export class SaveCircularSliderQuestionAnswer extends CircularSliderQuestionAnswerInput {
  @Field(() => String)
  user_id: string;

  @Field(() => String)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  form_id: string;

  @Field(() => String)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  page_id: string;

  @Field(() => String)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  schedule_id: string;

  @Field(() => String)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  session_id: string;

  @Field(() => String)
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_date: string;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_time: string;
}
export class SaveCustomInputFieldsQuestionAnswer extends CustomInputFieldsQuestionAnswerInput {
  @Field(() => String)
  user_id: string;

  @Field(() => String)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  form_id: string;

  @Field(() => String)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  page_id: string;

  @Field(() => String)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  schedule_id: string;

  @Field(() => String)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  session_id: string;

  @Field(() => String)
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_date: string;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_time: string;
}
export class SaveDatePickerInputQuestionAnswer extends DatePickerInputQuestionAnswerInput {
  @Field(() => String)
  user_id: string;

  @Field(() => String)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  form_id: string;

  @Field(() => String)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  page_id: string;

  @Field(() => String)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  schedule_id: string;

  @Field(() => String)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  session_id: string;

  @Field(() => String)
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_date: string;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_time: string;
}
export class SaveDrawInputQuestionAnswer extends DrawInputQuestionAnswerInput {
  @Field(() => String)
  user_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  form_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  page_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  schedule_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_id: string;

  @Field(() => String)
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_date: string;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_time: string;
}
export class SaveHorizontalRadioButtonsQuestionAnswer extends HorizontalRadioButtonsQuestionAnswerInput {
  @Field(() => String)
  user_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  form_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  page_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  schedule_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_id: string;

  @Field(() => String)
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_date: string;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_time: string;
}
export class SaveHorizontalSlidersQuestionAnswer extends HorizontalSlidersQuestionAnswerInput {
  @Field(() => String)
  user_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  form_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  page_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  schedule_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_id: string;

  @Field(() => String)
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_date: string;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_time: string;
}
export class SaveMoodSelectionQuestionAnswer extends MoodSelectionQuestionAnswerInput {
  @Field(() => String)
  user_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  form_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  page_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  schedule_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_id: string;

  @Field(() => String)
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_date: string;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_time: string;
}
export class SaveMultipleAnswersQuestionAnswer extends MultipleAnswersQuestionAnswerInput {
  @Field(() => String)
  user_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  form_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  page_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  schedule_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_id: string;

  @Field(() => String)
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_date: string;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_time: string;
}
export class SaveMultipleSelectButtonsQuestionAnswer extends MultipleSelectButtonsQuestionAnswerInput {
  @Field(() => String)
  user_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  form_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  page_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  schedule_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_id: string;

  @Field(() => String)
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_date: string;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_time: string;
}
export class SaveMultipleSelectCheckBoxQuestionAnswer extends MultipleSelectCheckBoxQuestionAnswerInput {
  @Field(() => String)
  user_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  form_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  page_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  schedule_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_id: string;

  @Field(() => String)
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_date: string;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_time: string;
}
export class SaveMultipleSwitchesSelectionQuestionAnswer extends MultipleSwitchesSelectionQuestionAnswerInput {
  @Field(() => String)
  user_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  form_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  page_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  schedule_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_id: string;

  @Field(() => String)
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_date: string;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_time: string;
}
export class SaveNumberInputQuestionAnswer extends NumberInputQuestionAnswerInput {
  @Field(() => String)
  user_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  form_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  page_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  schedule_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_id: string;

  @Field(() => String)
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_date: string;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_time: string;
}
export class SaveNumberSelectQuestionAnswer extends NumberSelectQuestionAnswerInput {
  @Field(() => String)
  user_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  form_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  page_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  schedule_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_id: string;

  @Field(() => String)
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_date: string;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_time: string;
}
export class SaveRadioWithImageQuestionAnswer extends RadioWithImageQuestionAnswerInput {
  @Field(() => String)
  user_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  form_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  page_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  schedule_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_id: string;

  @Field(() => String)
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_date: string;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_time: string;
}
export class SaveRangeImageTextQuestionAnswer extends RangeImageTextQuestionAnswerInput {
  @Field(() => String)
  user_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  form_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  page_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  schedule_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_id: string;

  @Field(() => String)
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_date: string;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_time: string;
}
export class SaveSingleSelectButtonsQuestionAnswer extends SingleSelectButtonsQuestionAnswerInput {
  @Field(() => String)
  user_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  form_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  page_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  schedule_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_id: string;

  @Field(() => String)
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_date: string;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_time: string;
}
export class SaveSingleSelectDropdownQuestionAnswer extends SingleSelectDropdownQuestionAnswerInput {
  @Field(() => String)
  user_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  form_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  page_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  schedule_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_id: string;

  @Field(() => String)
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_date: string;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_time: string;
}
export class SaveSingleSelectQuestionAnswer extends SingleSelectQuestionAnswerInput {
  @Field(() => String)
  user_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  form_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  page_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  schedule_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_id: string;

  @Field(() => String)
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_date: string;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_time: string;
}

export class SaveStepperQuestionAnswer extends StepperQuestionAnswerInput {
  @Field(() => String)
  user_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  form_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  page_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  schedule_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_id: string;

  @Field(() => String)
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_date: string;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_time: string;
}
export class SaveTextBoxInputQuestionAnswer extends TextBoxInputQuestionAnswerInput {
  @Field(() => String)
  user_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  form_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  page_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  schedule_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_id: string;

  @Field(() => String)
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_date: string;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_time: string;
}
export class SaveTextInputQuestionAnswer extends TextInputQuestionAnswerInput {
  @Field(() => String)
  user_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  form_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  page_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  schedule_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_id: string;

  @Field(() => String)
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_date: string;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_time: string;
}
export class SaveTimePickerQuestionAnswer extends TimePickerQuestionAnswerInput {
  @Field(() => String)
  user_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  form_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  page_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  schedule_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_id: string;

  @Field(() => String)
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_date: string;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_time: string;
}

export class SaveUploadImageQuestionAnswer extends UploadImageQuestionAnswerInput {
  @Field(() => String)
  user_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  form_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  page_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  schedule_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_id: string;

  @Field(() => String)
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_date: string;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_time: string;
}
export class SaveVerticalRadioQuestionAnswer extends VerticalRadioQuestionAnswerInput {
  @Field(() => String)
  user_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  form_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  page_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  schedule_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_id: string;

  @Field(() => String)
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_date: string;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_time: string;
}
export class SaveYesOrNoQuestionAnswer extends YesOrNoQuestionAnswerInput {
  @Field(() => String)
  user_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  form_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  page_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  schedule_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_id: string;

  @Field(() => String)
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_date: string;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_time: string;
}
export class SaveYesOrNoWithImageQuestionAnswer extends YesOrNoWithImageQuestionAnswerInput {
  @Field(() => String)
  user_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  form_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  page_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  schedule_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_id: string;

  @Field(() => String)
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_date: string;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_time: string;
}

export type SaveFormQuestionAnswers =
  | SaveAudioQuestionAnswer
  | SaveCircularSliderQuestionAnswer
  | SaveCustomInputFieldsQuestionAnswer
  | SaveDatePickerInputQuestionAnswer
  | SaveDrawInputQuestionAnswer
  | SaveHorizontalRadioButtonsQuestionAnswer
  | SaveHorizontalSlidersQuestionAnswer
  | SaveMoodSelectionQuestionAnswer
  | SaveNumberSelectQuestionAnswer
  | SaveNumberInputQuestionAnswer
  | SaveMultipleSwitchesSelectionQuestionAnswer
  | SaveMultipleSelectCheckBoxQuestionAnswer
  | SaveMultipleSelectButtonsQuestionAnswer
  | SaveMultipleAnswersQuestionAnswer
  | SaveRadioWithImageQuestionAnswer
  | SaveRangeImageTextQuestionAnswer
  | SaveSingleSelectButtonsQuestionAnswer
  | SaveSingleSelectDropdownQuestionAnswer
  | SaveSingleSelectQuestionAnswer
  | SaveStepperQuestionAnswer
  | SaveTextBoxInputQuestionAnswer
  | SaveTextInputQuestionAnswer
  | SaveTimePickerQuestionAnswer
  | SaveUploadImageQuestionAnswer
  | SaveVerticalRadioQuestionAnswer
  | SaveYesOrNoQuestionAnswer
  | SaveYesOrNoWithImageQuestionAnswer;

@InputType()
export class QuestionAnswers {
  @Field(() => [AudioQuestionAnswerInput], { nullable: true })
  @Type(() => AudioQuestionAnswerInput)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  audio_question_answer_input: AudioQuestionAnswerInput[];

  @Field(() => [CircularSliderQuestionAnswerInput], { nullable: true })
  @Type(() => CircularSliderQuestionAnswerInput)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  circular_slider_question_answer_input: CircularSliderQuestionAnswerInput[];

  @Field(() => [CustomInputFieldsQuestionAnswerInput], { nullable: true })
  @Type(() => CustomInputFieldsQuestionAnswerInput)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  custom_input_fields_question_answer_input: CustomInputFieldsQuestionAnswerInput[];

  @Field(() => [DatePickerInputQuestionAnswerInput], { nullable: true })
  @Type(() => DatePickerInputQuestionAnswerInput)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  date_picker_input_question_answer_input: DatePickerInputQuestionAnswerInput[];

  @Field(() => [DrawInputQuestionAnswerInput], { nullable: true })
  @Type(() => DrawInputQuestionAnswerInput)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  draw_input_question_answer_input: DrawInputQuestionAnswerInput[];

  @Field(() => [HorizontalRadioButtonsQuestionAnswerInput], { nullable: true })
  @Type(() => HorizontalRadioButtonsQuestionAnswerInput)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  horizontal_radio_buttons_question_answer_input: HorizontalRadioButtonsQuestionAnswerInput[];

  @Field(() => [HorizontalSlidersQuestionAnswerInput], { nullable: true })
  @Type(() => HorizontalSlidersQuestionAnswerInput)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  horizontal_sliders_question_answer_input: HorizontalSlidersQuestionAnswerInput[];

  @Field(() => [MoodSelectionQuestionAnswerInput], { nullable: true })
  @Type(() => MoodSelectionQuestionAnswerInput)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  mood_selection_question_answer_input: MoodSelectionQuestionAnswerInput[];

  @Field(() => [MultipleAnswersQuestionAnswerInput], { nullable: true })
  @Type(() => MultipleAnswersQuestionAnswerInput)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  multiple_answers_question_answer_input: MultipleAnswersQuestionAnswerInput[];

  @Field(() => [MultipleSelectButtonsQuestionAnswerInput], { nullable: true })
  @Type(() => MultipleSelectButtonsQuestionAnswerInput)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  multiple_select_buttons_question_answer_input: MultipleSelectButtonsQuestionAnswerInput[];

  @Field(() => [MultipleSelectCheckBoxQuestionAnswerInput], { nullable: true })
  @Type(() => MultipleSelectCheckBoxQuestionAnswerInput)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  multiple_select_check_box_question_answer_input: MultipleSelectCheckBoxQuestionAnswerInput[];

  @Field(() => [MultipleSwitchesSelectionQuestionAnswerInput], {
    nullable: true,
  })
  @Type(() => MultipleSwitchesSelectionQuestionAnswerInput)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  multiple_switches_selection_question_answer_input: MultipleSwitchesSelectionQuestionAnswerInput[];

  @Field(() => [NumberInputQuestionAnswerInput], { nullable: true })
  @Type(() => NumberInputQuestionAnswerInput)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  number_input_question_answer_input: NumberInputQuestionAnswerInput[];

  @Field(() => [NumberSelectQuestionAnswerInput], { nullable: true })
  @Type(() => NumberSelectQuestionAnswerInput)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  number_select_question_answer_input: NumberSelectQuestionAnswerInput[];

  @Field(() => [RadioWithImageQuestionAnswerInput], { nullable: true })
  @Type(() => RadioWithImageQuestionAnswerInput)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  radio_with_image_question_answer_input: RadioWithImageQuestionAnswerInput[];

  @Field(() => [RangeImageTextQuestionAnswerInput], { nullable: true })
  @Type(() => RangeImageTextQuestionAnswerInput)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  range_image_text_question_answer_input: RangeImageTextQuestionAnswerInput[];

  @Field(() => [SingleSelectButtonsQuestionAnswerInput], { nullable: true })
  @Type(() => SingleSelectButtonsQuestionAnswerInput)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  single_select_buttons_question_answer_input: SingleSelectButtonsQuestionAnswerInput[];

  @Field(() => [SingleSelectDropdownQuestionAnswerInput], { nullable: true })
  @Type(() => SingleSelectDropdownQuestionAnswerInput)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  single_select_dropdown_question_answer_input: SingleSelectDropdownQuestionAnswerInput[];

  @Field(() => [SingleSelectQuestionAnswerInput], { nullable: true })
  @Type(() => SingleSelectQuestionAnswerInput)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  single_select_question_answer_input: SingleSelectQuestionAnswerInput[];

  @Field(() => [StepperQuestionAnswerInput], { nullable: true })
  @Type(() => StepperQuestionAnswerInput)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  stepper_question_answer_input: StepperQuestionAnswerInput[];

  @Field(() => [TextBoxInputQuestionAnswerInput], { nullable: true })
  @Type(() => TextBoxInputQuestionAnswerInput)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  text_box_input_question_answer_input: TextBoxInputQuestionAnswerInput[];

  @Field(() => [TextInputQuestionAnswerInput], { nullable: true })
  @Type(() => TextInputQuestionAnswerInput)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  text_input_question_answer_input: TextInputQuestionAnswerInput[];

  @Field(() => [TimePickerQuestionAnswerInput], { nullable: true })
  @Type(() => TimePickerQuestionAnswerInput)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  time_picker_question_answer_input: TimePickerQuestionAnswerInput[];

  @Field(() => [UploadImageQuestionAnswerInput], { nullable: true })
  @Type(() => UploadImageQuestionAnswerInput)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  upload_image_question_answer_input: UploadImageQuestionAnswerInput[];

  @Field(() => [VerticalRadioQuestionAnswerInput], { nullable: true })
  @Type(() => VerticalRadioQuestionAnswerInput)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  vertical_radio_question_answer_input: VerticalRadioQuestionAnswerInput[];

  @Field(() => [YesOrNoQuestionAnswerInput], { nullable: true })
  @Type(() => YesOrNoQuestionAnswerInput)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  yes_or_no_question_answer_input: YesOrNoQuestionAnswerInput[];

  @Field(() => [YesOrNoWithImageQuestionAnswerInput], { nullable: true })
  @Type(() => YesOrNoWithImageQuestionAnswerInput)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  yes_or_no_with_image_question_answer_input: YesOrNoWithImageQuestionAnswerInput[];
}

@InputType()
export class SaveFormPageQuestionAnswersInput {
  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  form_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  page_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  schedule_id: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_id: string;

  @Field(() => String)
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_date: string;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  session_time: string;

  @Field(() => QuestionAnswers)
  @Type(() => QuestionAnswers)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  question_answers: QuestionAnswers;
}

@ObjectType()
export class SaveFormPageQuestionAnswersResponse {
  @Field(() => String)
  response: string;
}
