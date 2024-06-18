import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field, ObjectType, PickType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { Treatment } from '../entities/treatments.entity';
import { Doctor } from '@doctors/entities/doctors.entity';
import { Users } from '@users/users.model';

@ArgsType()
export class GetTreatmentTeamArgs {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field(() => String)
  treatmentId: string;
}

@ObjectType()
export class GetCoachesWithTreatment extends PickType(Doctor, [
  'id',
  'user_name',
  'image_url',
  'image_id',
  'file_path',
  'first_name',
  'last_name',
]) {
  @Field(() => String)
  doctor_treatment_id: string;

  @Field(() => Boolean)
  is_owner: boolean;

  @Field(() => String)
  treatment_id: string;

  @Field(() => String)
  doctor_treatment_role: string;
}

@ObjectType()
export class GetBuddiesWithTreatment extends PickType(Users, [
  'id',
  'user_name',
  'first_name',
  'last_name',
  'full_name',
  'avatar_image_name',
]) {
  @Field(() => String)
  treatment_id: string;

  @Field(() => String)
  treatment_buddy_id: string;
}

@ObjectType()
export class GetTreatmentTeamResponse {
  @Field(() => Treatment, { nullable: true })
  treatment?: Treatment;

  @Field(() => [GetCoachesWithTreatment], { nullable: true })
  coaches: GetCoachesWithTreatment[];

  @Field(() => [GetBuddiesWithTreatment], { nullable: true })
  buddies: GetBuddiesWithTreatment[];
}
