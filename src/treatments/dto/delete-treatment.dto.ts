import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { DoctorTreatment } from '../entities/doctor-treatments.entity';
import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { i18nValidationMessage } from '@core/modules/i18n-next';

@ArgsType()
export class DeleteDoctorTreatmentArgs {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field(() => String)
  doctorTreatmentId: string;
}

@ObjectType()
export class DeleteTreatmentResponse extends DoctorTreatment {}
