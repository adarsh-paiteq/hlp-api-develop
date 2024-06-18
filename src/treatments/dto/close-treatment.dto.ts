import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { Treatment } from '@treatments/entities/treatments.entity';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

@ArgsType()
export class CloseTreatmentArgs {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field(() => String)
  treatment_id: string;
}

@ObjectType()
export class CloseTreatmentResponse {
  @Field(() => Treatment)
  treatment: Treatment;
}
