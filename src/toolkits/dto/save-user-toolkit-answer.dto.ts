import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsDateString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { i18nValidationMessage } from '@core/modules/i18n-next';

@InputType()
export class SaveUserToolkitAnswerInput {
  @Field(() => String)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  toolkit_id: string;

  @Field(() => String)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  schedule_id: string;

  @Field(() => String, { nullable: true })
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  session_date?: string;
}

@ObjectType()
export class SaveUserToolkitAnswerResponse {
  @Field(() => String)
  message: string;
}

export class InsertUserToolkitAnswerInput extends SaveUserToolkitAnswerInput {
  user_id: string;
  hlp_points_earned: number;
  session_date: string;
}
