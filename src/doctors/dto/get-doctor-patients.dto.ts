import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field, Int, ObjectType, PickType } from '@nestjs/graphql';
import { PaginationArgs } from '@shared/dto/pagination-params.dto';
import { Users } from '@users/users.model';
import { IsOptional, IsString } from 'class-validator';
@ArgsType()
export class GetDoctorPatientsArgs extends PaginationArgs {
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsString({ message: i18nValidationMessage('is_string') })
  @Field(() => String, { nullable: true })
  search?: string;
}

@ObjectType()
export class PatientsData extends PickType(Users, [
  'id',
  'user_name',
  'avatar',
  'avatar_image_name',
  'full_name',
  'first_name',
  'last_name',
]) {
  @Field(() => String, { nullable: true })
  treatment_id?: string;
}

@ObjectType()
export class GetDoctorPatientsResponse {
  @Field(() => [PatientsData], { nullable: true })
  patients: PatientsData[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;
}
