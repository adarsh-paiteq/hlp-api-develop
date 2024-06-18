import { i18nValidationMessage } from '@core/modules/i18n-next';
import { FormPageQuestion } from '@forms/entities/form-page-question.entity';
import {
  ArgsType,
  Field,
  Int,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { FormQuestionAnswers } from './save-form-page-question-answers.dto';
import { QuestionOptions } from './get-form-page-questions.dto';

export enum FormInsightType {
  SESSION = 'SESSION',
  COMPLAINT = 'COMPLAINT',
}

registerEnumType(FormInsightType, { name: 'FormInsightType' });

@ArgsType()
export class GetAppointmentFormsInsightArgs {
  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  treatmentId: string;

  @Field(() => FormInsightType, {
    nullable: false,
    description: `FormInsightType must be ${Object.values(FormInsightType)}`,
  })
  @IsEnum(FormInsightType, { message: i18nValidationMessage('is_enum') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  formInsightType: FormInsightType;

  @Field(() => [Int], {
    nullable: true,
    defaultValue: [],
    description:
      'Accepts integer values from 1 to 7. which is category-1 to category-7 ',
  })
  @IsArray()
  @IsNumber({}, { message: i18nValidationMessage('is_number'), each: true })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  categoryFilter?: number[];
}

@ObjectType()
export class AppointmentFormQuestionInsight {
  @Field(() => String)
  question_id: string;

  @Field(() => Number)
  category_sequence: number;

  @Field(() => Number)
  earned_points: number;

  @Field(() => Number)
  maximum_points: number;

  @Field(() => String)
  date: string;
}

@ObjectType()
export class AppointmentFormInsight {
  @Field(() => String)
  date: string;

  @Field(() => [AppointmentFormQuestionInsight], { nullable: true })
  questionInsight: AppointmentFormQuestionInsight[];
}

@ObjectType()
export class GetAppointmentFormsInsightResponse {
  @Field(() => [AppointmentFormInsight], { nullable: true })
  appointment_form_insight: AppointmentFormInsight[];
}

export class FormQuestionAndOptionsWithAnswer extends FormPageQuestion {
  options: QuestionOptions[];
  answers: FormQuestionAnswers[];
}

export class FormQuestionAndAnswersWithDate {
  date: string;
  form_questions_and_options_with_answers: FormQuestionAndOptionsWithAnswer[];
}
