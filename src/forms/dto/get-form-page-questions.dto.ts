import { ArgsType, createUnionType, Field, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { GraphQLInt } from 'graphql';
import { CircularSlider } from '../entities/circular-slider.entity';
import { FormPageQuestion } from '../entities/form-page-question.entity';
import { FormPage } from '../entities/form-page.entity';
import { HorizontalSlider } from '../entities/horizontal-slider.entity';
import { InputFieldOption } from '../entities/input-field-options.entity';
import { NumberSelectOption } from '../entities/number-select-option.entity';
import { OrderListInfoOption } from '../entities/order-list-info-option.entity';
import { QuestionAudio } from '../entities/question-audios.entity';
import { QuestionImage } from '../entities/question-images.entity';
import { QuestionValidation } from '../entities/question-validations.entity';
import { QuestionVideos } from '../entities/question-videos.entity';
import { StepperOption } from '../entities/stepper-option.entity';
import { Toolkit } from '../../toolkits/toolkits.model';
import { i18nValidationMessage } from '@core/modules/i18n-next';

@ArgsType()
export class GetFormPageQuestionsArgs {
  @Field(() => String)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  formId: string;

  @Field(() => String)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  pageId: string;
}

@ObjectType()
export class CommonQuestionOption {
  @Field(() => String)
  id: string;
  @Field(() => String)
  title: string;
  @Field(() => String)
  form: string;
  @Field(() => String)
  page: string;
  @Field(() => String)
  question: string;
  @Field(() => String)
  created_at: string;
  @Field(() => String)
  updated_at: string;
  @Field(() => GraphQLInt, { nullable: true })
  points?: number;
}

@ObjectType()
export class CommonQuestionOptionWithStatus extends CommonQuestionOption {
  @Field(() => Boolean)
  is_selected: boolean;
}
@ObjectType()
export class InputFieldOptionWithStatus extends InputFieldOption {
  @Field(() => Boolean)
  is_selected: boolean;
}
@ObjectType()
export class NumberSelectOptionWithStatus extends NumberSelectOption {
  @Field(() => Boolean)
  is_selected: boolean;
}
@ObjectType()
export class OrderListInfoOptionWithStatus extends OrderListInfoOption {
  @Field(() => Boolean)
  is_selected: boolean;
}
@ObjectType()
export class StepperOptionWithStatus extends StepperOption {
  @Field(() => Boolean)
  is_selected: boolean;
}
@ObjectType()
export class CircularSliderWithStatus extends CircularSlider {
  @Field(() => Boolean)
  is_selected: boolean;
}
@ObjectType()
export class HorizontalSliderWithStatus extends HorizontalSlider {
  @Field(() => Boolean)
  is_selected: boolean;
}

export type QuestionOptions =
  | CommonQuestionOption
  | InputFieldOption
  | NumberSelectOption
  | OrderListInfoOption
  | StepperOption
  | CircularSlider
  | HorizontalSlider
  | QuestionAudio
  | QuestionImage
  | QuestionVideos;

export type QuestionOptionsWithStatus =
  | CommonQuestionOptionWithStatus
  | InputFieldOptionWithStatus
  | NumberSelectOptionWithStatus
  | OrderListInfoOptionWithStatus
  | StepperOptionWithStatus
  | CircularSliderWithStatus
  | HorizontalSliderWithStatus
  | QuestionAudio
  | QuestionImage
  | QuestionVideos;

export const QuestionOptionsWithStatus = createUnionType({
  name: 'QuestionOptionsWithStatus',
  types: () =>
    [
      InputFieldOptionWithStatus,
      NumberSelectOptionWithStatus,
      OrderListInfoOptionWithStatus,
      StepperOptionWithStatus,
      CommonQuestionOptionWithStatus,
      CircularSliderWithStatus,
      HorizontalSliderWithStatus,
      QuestionAudio,
      QuestionImage,
      QuestionVideos,
    ] as const,
  resolveType: (value) => {
    if ('input_type' in value) {
      return InputFieldOptionWithStatus;
    }
    if ('answer' in value) {
      return NumberSelectOptionWithStatus;
    }
    if ('operation_type' in value) {
      return StepperOptionWithStatus;
    }
    if ('maximum_angle' in value) {
      return CircularSliderWithStatus;
    }
    if ('maximum_value' in value) {
      return HorizontalSliderWithStatus;
    }
    if ('audio_url' in value) {
      return QuestionAudio;
    }
    if ('image_url' in value) {
      return QuestionImage;
    }
    if ('video_url' in value) {
      return QuestionVideos;
    }
    if (!('points' in value)) {
      return OrderListInfoOptionWithStatus;
    }
    return CommonQuestionOptionWithStatus;
  },
});

export class PageQuestionsWithOptionsDto {
  question: FormPageQuestion;
  validations: QuestionValidation[];
  image: QuestionImage;
  audio: QuestionAudio;
  video: QuestionVideos;
  toolkit: Toolkit;
  options: QuestionOptions[];
}

@ObjectType()
export class PageQuestions {
  @Field(() => FormPageQuestion)
  question: FormPageQuestion;

  @Field(() => [QuestionValidation])
  validations: QuestionValidation[];

  @Field(() => QuestionImage, { nullable: true })
  image: QuestionImage;

  @Field(() => QuestionAudio, { nullable: true })
  audio: QuestionAudio;

  @Field(() => QuestionVideos, { nullable: true })
  video: QuestionVideos;

  @Field(() => Toolkit, { nullable: true })
  toolkit: Toolkit;

  @Field(() => [QuestionOptionsWithStatus])
  options: QuestionOptionsWithStatus[];
}

@ObjectType()
export class GetFormQuestionsResponse {
  @Field(() => FormPage)
  formPage: FormPage;

  @Field(() => [PageQuestions])
  pageQuestions: PageQuestions[];

  @Field(() => String, { nullable: true })
  nextPageId?: string;
}
