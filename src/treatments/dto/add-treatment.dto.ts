import { i18nValidationMessage } from '@core/modules/i18n-next';
import {
  ArgsType,
  Field,
  ObjectType,
  PickType,
  registerEnumType,
} from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { Treatment } from '../entities/treatments.entity';
import { DoctorTreatment } from '@treatments/entities/doctor-treatments.entity';

export enum TreatmentRoles {
  doctor = 'doctor',
  coach = 'coach',
  coordinating_therapist = 'coordinating_therapist',
  experience_expert = 'experience_expert',
  groups_therapist = 'groups_therapist',
  intaker = 'intaker',
  psychiatrist = 'psychiatrist',
  directional_therapist = 'directional_therapist',
  SPV = 'SPV',
  nurse = 'nurse',
  therapist = 'therapist',
  secretary = 'secretary',
}

registerEnumType(TreatmentRoles, { name: 'TreatmentRoles' });

@ArgsType()
export class AddTreatmentArgs {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field(() => String)
  user_id: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field(() => String)
  option_id: string;

  @IsEnum(TreatmentRoles, { message: i18nValidationMessage('is_enum') })
  @Field(() => TreatmentRoles, {
    nullable: false,
    description: `Role must be ${Object.values(TreatmentRoles)}`,
  })
  role: TreatmentRoles;
}

@ObjectType()
export class TreatmentResponse extends Treatment {
  @Field()
  is_treatment_exist: boolean;
}

export class DoctorTreatmentDto extends PickType(DoctorTreatment, [
  'doctor_id',
  'treatment_id',
  'role',
  'updated_by',
  'created_by',
]) {
  is_owner?: boolean;
}
