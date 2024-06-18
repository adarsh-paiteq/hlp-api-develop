import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { TreatmentRoles } from './add-treatment.dto';
import { DoctorTreatment } from '../entities/doctor-treatments.entity';

@ArgsType()
export class JoinTreatmentArgs {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field(() => String)
  treatment_id: string;

  @IsEnum(TreatmentRoles, { message: i18nValidationMessage('is_enum') })
  @Field(() => TreatmentRoles, {
    nullable: false,
    description: `Role must be ${Object.values(TreatmentRoles)}`,
  })
  role: TreatmentRoles;
}

@ObjectType()
export class JoinTreatmentResponse extends DoctorTreatment {}
