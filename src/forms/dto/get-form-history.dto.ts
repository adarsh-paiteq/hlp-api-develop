import { ArgsType, Field, ObjectType, createUnionType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { FormPage } from '../entities/form-page.entity';
import { GraphQLInt } from 'graphql';
import {
  FormPageQuestion,
  QuestionType,
} from '../entities/form-page-question.entity';
import { QuestionImage } from '../entities/question-images.entity';
import { QuestionAudio } from '../entities/question-audios.entity';
import { QuestionVideos } from '../entities/question-videos.entity';
import { Toolkit } from '../../toolkits/toolkits.model';
import {
  QuestionOptions,
  QuestionOptionsWithStatus,
} from './get-form-page-questions.dto';
import { FormQuestionAnswers } from './save-form-page-question-answers.dto';
import { AudioQuestionAnswer } from '../entities/audio-question-answer.entity';
import { CircularSliderQuestionAnswer } from '../entities/circular-slider-question-answer.entity';
import { CustomInputFieldsQuestionAnswer } from '../entities/custom-input-fields-question-answer.entity';
import { DatePickerInputQuestionAnswer } from '../entities/date-picker-input-question-answer.entity';
import { DrawInputQuestionAnswer } from '../entities/draw-input-question-answer.entity';
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

@ArgsType()
export class GetFormHistoryArgs {
  @Field(() => String, {
    nullable: true,
    description: 'toolkitId not required when using this query for appointment',
  })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  toolkitId: string;

  @Field(() => String, {
    nullable: true,
    description: 'formId required when using this query for appointment',
  })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  formId: string;

  @Field(() => String)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  sessionId: string;

  @Field(() => String, { nullable: true })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  nextPageId?: string;
}

export class PageQuestionAnswersDto {
  question: FormPageQuestion;
  answers: FormQuestionAnswers[];
  image: QuestionImage;
  audio: QuestionAudio;
  video: QuestionVideos;
  toolkit: Toolkit;
  options: QuestionOptions[];
}

@ObjectType()
export class AudioQuestionAnswerHistory extends AudioQuestionAnswer {
  @Field(() => QuestionType)
  question_type: QuestionType;
}

@ObjectType()
export class CircularSliderQuestionAnswerHistory extends CircularSliderQuestionAnswer {
  @Field(() => QuestionType)
  question_type: QuestionType;
}
@ObjectType()
export class CustomInputFieldsQuestionAnswerHistory extends CustomInputFieldsQuestionAnswer {
  @Field(() => QuestionType)
  question_type: QuestionType;
}
@ObjectType()
export class DatePickerInputQuestionAnswerHistory extends DatePickerInputQuestionAnswer {
  @Field(() => QuestionType)
  question_type: QuestionType;
}
@ObjectType()
export class DrawInputQuestionAnswerHistory extends DrawInputQuestionAnswer {
  @Field(() => QuestionType)
  question_type: QuestionType;
}
@ObjectType()
export class HorizontalRadioButtonsQuestionAnswerHistory extends HorizontalRadioButtonsQuestionAnswer {
  @Field(() => QuestionType)
  question_type: QuestionType;
}
@ObjectType()
export class HorizontalSlidersQuestionAnswerHistory extends HorizontalSlidersQuestionAnswer {
  @Field(() => QuestionType)
  question_type: QuestionType;
}
@ObjectType()
export class MoodSelectionQuestionAnswerHistory extends MoodSelectionQuestionAnswer {
  @Field(() => QuestionType)
  question_type: QuestionType;
}
@ObjectType()
export class MultipleAnswersQuestionAnswerHistory extends MultipleAnswersQuestionAnswer {
  @Field(() => QuestionType)
  question_type: QuestionType;
}
@ObjectType()
export class MultipleSelectButtonsQuestionAnswerHistory extends MultipleSelectButtonsQuestionAnswer {
  @Field(() => QuestionType)
  question_type: QuestionType;
}
@ObjectType()
export class MultipleSelectCheckBoxQuestionAnswerHistory extends MultipleSelectCheckBoxQuestionAnswer {
  @Field(() => QuestionType)
  question_type: QuestionType;
}
@ObjectType()
export class MultipleSwitchesSelectionQuestionAnswerHistory extends MultipleSwitchesSelectionQuestionAnswer {
  @Field(() => QuestionType)
  question_type: QuestionType;
}
@ObjectType()
export class NumberSelectQuestionAnswerHistory extends NumberSelectQuestionAnswer {
  @Field(() => QuestionType)
  question_type: QuestionType;
}

@ObjectType()
export class NumberInputQuestionAnswerHistory extends NumberInputQuestionAnswer {
  @Field(() => QuestionType)
  question_type: QuestionType;
}
@ObjectType()
export class RadioWithImageQuestionAnswerHistory extends RadioWithImageQuestionAnswer {
  @Field(() => QuestionType)
  question_type: QuestionType;
}
@ObjectType()
export class RangeImageTextQuestionAnswerHistory extends RangeImageTextQuestionAnswer {
  @Field(() => QuestionType)
  question_type: QuestionType;
}
@ObjectType()
export class SingleSelectButtonsQuestionAnswerHistory extends SingleSelectButtonsQuestionAnswer {
  @Field(() => QuestionType)
  question_type: QuestionType;
}
@ObjectType()
export class SingleSelectDropdownQuestionAnswerHistory extends SingleSelectDropdownQuestionAnswer {
  @Field(() => QuestionType)
  question_type: QuestionType;
}
@ObjectType()
export class SingleSelectQuestionAnswerHistory extends SingleSelectQuestionAnswer {
  @Field(() => QuestionType)
  question_type: QuestionType;
}
@ObjectType()
export class StepperQuestionAnswerHistory extends StepperQuestionAnswer {
  @Field(() => QuestionType)
  question_type: QuestionType;
}
@ObjectType()
export class TextBoxInputQuestionAnswerHistory extends TextBoxInputQuestionAnswer {
  @Field(() => QuestionType)
  question_type: QuestionType;
}
@ObjectType()
export class TextInputQuestionAnswerHistory extends TextInputQuestionAnswer {
  @Field(() => QuestionType)
  question_type: QuestionType;
}
@ObjectType()
export class TimePickerQuestionAnswerHistory extends TimePickerQuestionAnswer {
  @Field(() => QuestionType)
  question_type: QuestionType;
}
@ObjectType()
export class UploadImageQuestionAnswerHistory extends UploadImageQuestionAnswer {
  @Field(() => QuestionType)
  question_type: QuestionType;
}
@ObjectType()
export class VerticalRadioQuestionAnswerHistory extends VerticalRadioQuestionAnswer {
  @Field(() => QuestionType)
  question_type: QuestionType;
}
@ObjectType()
export class YesOrNoQuestionAnswerHistory extends YesOrNoQuestionAnswer {
  @Field(() => QuestionType)
  question_type: QuestionType;
}
@ObjectType()
export class YesOrNoWithImageQuestionAnswerHistory extends YesOrNoWithImageQuestionAnswer {
  @Field(() => QuestionType)
  question_type: QuestionType;
}
export type FormHistoryQuestionAnswers =
  | AudioQuestionAnswerHistory
  | CircularSliderQuestionAnswerHistory
  | CustomInputFieldsQuestionAnswerHistory
  | DatePickerInputQuestionAnswerHistory
  | DrawInputQuestionAnswerHistory
  | HorizontalRadioButtonsQuestionAnswerHistory
  | HorizontalSlidersQuestionAnswerHistory
  | MoodSelectionQuestionAnswerHistory
  | MultipleAnswersQuestionAnswerHistory
  | MultipleSelectButtonsQuestionAnswerHistory
  | MultipleSelectCheckBoxQuestionAnswerHistory
  | MultipleSwitchesSelectionQuestionAnswerHistory
  | NumberInputQuestionAnswerHistory
  | NumberSelectQuestionAnswerHistory
  | RadioWithImageQuestionAnswerHistory
  | RangeImageTextQuestionAnswerHistory
  | SingleSelectButtonsQuestionAnswerHistory
  | SingleSelectDropdownQuestionAnswerHistory
  | SingleSelectQuestionAnswerHistory
  | StepperQuestionAnswerHistory
  | TextBoxInputQuestionAnswerHistory
  | TextInputQuestionAnswerHistory
  | TimePickerQuestionAnswerHistory
  | UploadImageQuestionAnswerHistory
  | VerticalRadioQuestionAnswerHistory
  | YesOrNoQuestionAnswerHistory
  | YesOrNoWithImageQuestionAnswerHistory;

export const FormHistoryQuestionAnswers = createUnionType({
  name: 'FormHistoryQuestionAnswers',
  types: () =>
    [
      AudioQuestionAnswerHistory,
      CircularSliderQuestionAnswerHistory,
      CustomInputFieldsQuestionAnswerHistory,
      DatePickerInputQuestionAnswerHistory,
      DrawInputQuestionAnswerHistory,
      HorizontalRadioButtonsQuestionAnswerHistory,
      HorizontalSlidersQuestionAnswerHistory,
      MoodSelectionQuestionAnswerHistory,
      MultipleAnswersQuestionAnswerHistory,
      MultipleSelectButtonsQuestionAnswerHistory,
      MultipleSelectCheckBoxQuestionAnswerHistory,
      MultipleSwitchesSelectionQuestionAnswerHistory,
      NumberInputQuestionAnswerHistory,
      NumberSelectQuestionAnswerHistory,
      RadioWithImageQuestionAnswerHistory,
      RangeImageTextQuestionAnswerHistory,
      SingleSelectButtonsQuestionAnswerHistory,
      SingleSelectDropdownQuestionAnswerHistory,
      SingleSelectQuestionAnswerHistory,
      StepperQuestionAnswerHistory,
      TextBoxInputQuestionAnswerHistory,
      TextInputQuestionAnswerHistory,
      TimePickerQuestionAnswerHistory,
      UploadImageQuestionAnswerHistory,
      VerticalRadioQuestionAnswerHistory,
      YesOrNoQuestionAnswerHistory,
      YesOrNoWithImageQuestionAnswerHistory,
    ] as const,
  resolveType: (value) => {
    if (value['question_type'] === QuestionType.AUDIO) {
      return AudioQuestionAnswerHistory;
    }

    if (value['question_type'] === QuestionType.CIRCULAR_SLIDER) {
      return CircularSliderQuestionAnswerHistory;
    }
    if (
      value['question_type'] ===
      QuestionType.INPUT_FIELDS_WITH_SIZE_CONFIGURATION
    ) {
      return CustomInputFieldsQuestionAnswerHistory;
    }
    if (value['question_type'] === QuestionType.DATE_PICKER_INPUT) {
      return DatePickerInputQuestionAnswerHistory;
    }
    if (value['question_type'] === QuestionType.DRAW_INPUT) {
      return DrawInputQuestionAnswerHistory;
    }
    if (value['question_type'] === QuestionType.HORIZONTAL_RADIO_BUTTONS) {
      return HorizontalRadioButtonsQuestionAnswerHistory;
    }
    if (value['question_type'] === QuestionType.HORIZONTAL_SLIDER) {
      return HorizontalSlidersQuestionAnswerHistory;
    }
    if (value['question_type'] === QuestionType.MOOD_SELECTION) {
      return MoodSelectionQuestionAnswerHistory;
    }
    if (value['question_type'] === QuestionType.MULTIPLE_ANSWERS) {
      return MultipleAnswersQuestionAnswerHistory;
    }
    if (value['question_type'] === QuestionType.MULTI_SELECT_BUTTONS) {
      return MultipleSelectButtonsQuestionAnswerHistory;
    }
    if (value['question_type'] === QuestionType.MULTI_SELECT) {
      return MultipleSelectCheckBoxQuestionAnswerHistory;
    }
    if (value['question_type'] === QuestionType.MULTIPLE_SWITCHES) {
      return MultipleSwitchesSelectionQuestionAnswerHistory;
    }
    if (value['question_type'] === QuestionType.NUMBER_INPUT) {
      return NumberInputQuestionAnswerHistory;
    }
    if (value['question_type'] === QuestionType.NUMBER_SELECT) {
      return NumberSelectQuestionAnswerHistory;
    }
    if (value['question_type'] === QuestionType.RADIO_WITH_IMAGE) {
      return RadioWithImageQuestionAnswerHistory;
    }
    if (value['question_type'] === QuestionType.RANGE_IMAGE_TEXT) {
      return RangeImageTextQuestionAnswerHistory;
    }
    if (value['question_type'] === QuestionType.SINGLE_SELECT_BUTTONS) {
      return SingleSelectButtonsQuestionAnswerHistory;
    }
    if (value['question_type'] === QuestionType.SINGLE_SELECT_DROPDOWN_LIST) {
      return SingleSelectDropdownQuestionAnswerHistory;
    }
    if (value['question_type'] === QuestionType.SINGLE_SELECT) {
      return SingleSelectQuestionAnswerHistory;
    }
    if (value['question_type'] === QuestionType.STEPPER) {
      return StepperQuestionAnswerHistory;
    }
    if (value['question_type'] === QuestionType.TEXT_BOX) {
      return TextBoxInputQuestionAnswerHistory;
    }
    if (value['question_type'] === QuestionType.TEXT_INPUT) {
      return TextInputQuestionAnswerHistory;
    }
    if (value['question_type'] === QuestionType.TIME_PICKER) {
      return TimePickerQuestionAnswerHistory;
    }
    if (value['question_type'] === QuestionType.UPLOAD_IMAGE) {
      return UploadImageQuestionAnswerHistory;
    }
    if (value['question_type'] === QuestionType.VERTICAL_RADIO_BUTTONS) {
      return VerticalRadioQuestionAnswerHistory;
    }
    if (value['question_type'] === QuestionType.YES_OR_NO) {
      return YesOrNoQuestionAnswerHistory;
    }
    if (value['question_type'] === QuestionType.YES_OR_NO_WITH_IMAGE) {
      return YesOrNoWithImageQuestionAnswerHistory;
    }
  },
});

@ObjectType()
export class PageQuestionAnswers {
  @Field(() => FormPageQuestion)
  question: FormPageQuestion;

  @Field(() => [FormHistoryQuestionAnswers])
  answers: FormHistoryQuestionAnswers[];

  @Field(() => [QuestionOptionsWithStatus])
  options: QuestionOptionsWithStatus[];

  @Field(() => QuestionImage, { nullable: true })
  image: QuestionImage;

  @Field(() => QuestionAudio, { nullable: true })
  audio: QuestionAudio;

  @Field(() => QuestionVideos, { nullable: true })
  video: QuestionVideos;

  @Field(() => Toolkit, { nullable: true })
  toolkit: Toolkit;
}

@ObjectType()
export class GetFormHistoryResponse {
  @Field(() => FormPage)
  formPage: FormPage;

  @Field(() => GraphQLInt)
  totalPages: number;

  @Field(() => String, { nullable: true })
  nextPageId?: string;

  @Field(() => [PageQuestionAnswers])
  pageQuestionAnswers: PageQuestionAnswers[];
}
