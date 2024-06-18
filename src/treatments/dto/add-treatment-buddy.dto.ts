import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

@ArgsType()
export class AddTreatmentBuddyArgs {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field(() => String)
  treatmentId: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field(() => String)
  buddyId: string;
}

@ObjectType()
export class AddTreatmentBuddyResponse {
  @Field(() => String)
  message: string;
}

export class TreatmentBuddyInput {
  treatment_id: string;
  user_id: string;
  is_deleted: boolean;
  created_by: string;
  updated_by: string;
}
