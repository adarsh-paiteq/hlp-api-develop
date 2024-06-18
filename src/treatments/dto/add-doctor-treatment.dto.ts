import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { JoinTreatmentArgs } from './join-treatment.dto';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { i18nValidationMessage } from '@core/modules/i18n-next';

@ArgsType()
export class AddDoctorTreatmentArgs extends JoinTreatmentArgs {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field(() => String)
  doctor_id: string;
}

@ObjectType()
export class AddDoctorTreatmentResponse {
  @Field(() => String)
  message: string;
}
