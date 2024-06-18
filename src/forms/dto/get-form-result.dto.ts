import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { Toolkit } from '../../toolkits/toolkits.model';
import { FormSubmitPageInfo } from '../entities/form-submit-page-info.entity';
import { GraphQLInt } from 'graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { i18nValidationMessage } from '@core/modules/i18n-next';

export class FormResultPageDetails {
  form_submit_page_info: FormSubmitPageInfo;
  tool_kits?: Toolkit;
}

@ArgsType()
export class FormResultArgs {
  @Field(() => String)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  userFormAnswersId: string;
}

@ObjectType()
export class FormResultResponse {
  @Field(() => GraphQLInt)
  hlpPointsEarned: number;

  @Field(() => FormSubmitPageInfo, { nullable: true })
  formSubmitPageInfo?: FormSubmitPageInfo;

  @Field(() => Toolkit, { nullable: true })
  recommendedToolkit?: Toolkit;
}
