import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field, ObjectType, PickType } from '@nestjs/graphql';
import { Users } from '@users/users.model';
import { IsOptional, IsString } from 'class-validator';

@ObjectType()
export class PatientsListData extends PickType(Users, [
  'id',
  'user_name',
  'avatar',
  'avatar_image_name',
  'full_name',
  'first_name',
  'last_name',
]) {}

@ObjectType()
export class GetDoctorPatientListResponse {
  @Field(() => [PatientsListData], { nullable: true })
  patients: PatientsListData[];
}

@ArgsType()
export class GetDoctorPatientListArgs {
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsString({ message: i18nValidationMessage('is_string') })
  @Field(() => String, { nullable: true })
  search?: string;
}
