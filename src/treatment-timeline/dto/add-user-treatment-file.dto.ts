import { IsNotEmpty, IsUUID } from 'class-validator';
import { AddTreatmentFileInput } from './add-treatment-file.dto';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { i18nValidationMessage } from '@core/modules/i18n-next';

@InputType()
export class AddUserTreatmentFileInput extends AddTreatmentFileInput {
  @Field(() => String)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  user_id: string;
}

@ObjectType()
export class AddUserTreatmentFileResponse {
  @Field(() => String)
  message: string;
}
