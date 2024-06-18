import { i18nValidationMessage } from '@core/modules/i18n-next';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateSupportQuestionInput {
  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  title: string;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  description: string;
}

export class InsertSupportQuestion extends CreateSupportQuestionInput {
  doctor_id: string;
}

@ObjectType()
export class CreateSupportQuestionResponse {
  @Field(() => String)
  message: string;
}
