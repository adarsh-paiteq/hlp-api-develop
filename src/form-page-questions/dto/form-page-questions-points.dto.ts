import { ArgsType, Field, Int, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { FormSubmitPageInfo } from '../../forms/entities/form-submit-page-info.entity';
import { Toolkit } from '../../toolkits/toolkits.model';
import { QuestionType } from '../entities/form-page-question.entity';
import { i18nValidationMessage } from '@core/modules/i18n-next';

@ArgsType()
export class GetFormResultArgs {
  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  userFormAnswersId: string;
}

@ObjectType()
export class GetFormResultResponse {
  @Field(() => Int)
  points: number;

  @Field(() => FormSubmitPageInfo)
  formSubmitPageInfo: FormSubmitPageInfo;

  @Field(() => Toolkit)
  recommendedToolkit: Toolkit;
}

export const QuestionTableNames = new Map<string, string>([
  [QuestionType.MULTI_SELECT, 'multiple_select_options'],
  [QuestionType.CIRCULAR_SLIDER, 'circular_slider'],
]);

@ObjectType()
export class GenerateUUIDResponse {
  @Field(() => String)
  uuid: string;
}

@ObjectType()
export class FormResultPageDetails {
  form_submit_page_info: FormSubmitPageInfo[];
  tool_kits: Toolkit[];
}
