import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { TreatmentRoles } from './add-treatment.dto';

@ArgsType()
export class ChangeCoachRoleArgs {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field(() => String)
  treatmentId: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field(() => String)
  coachId: string;

  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsEnum(TreatmentRoles, { message: i18nValidationMessage('is_enum') })
  @Field(() => TreatmentRoles, {
    description: `TreatmentRoles must be ${Object.values(TreatmentRoles)}`,
  })
  treatment_role: TreatmentRoles;
}
@ObjectType()
export class ChangeCoachRoleResponse {
  @Field(() => String)
  message: string;
}
