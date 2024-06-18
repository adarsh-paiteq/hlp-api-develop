import { i18nValidationMessage } from '@core/modules/i18n-next';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class UpdateTreatmentComplaintInput {
  @Field()
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  userId: string;

  @Field()
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  treatmentId: string;

  @IsUUID('all', { message: i18nValidationMessage('is_uuid'), each: true })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @Field(() => [String], {
    nullable: true,
    description: 'treatment complain ids',
  })
  treatmentComplaintsIds?: string[];
}

@ObjectType()
export class UpdateTreatmentComplaintResponse {
  @Field(() => String)
  message: string;
}

export class TreatmentPatientComplaintDTO {
  user_id: string;
  treatment_id: string;
  treatment_complaint_id: string;
}
