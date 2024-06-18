import { i18nValidationMessage } from '@core/modules/i18n-next';
import { Doctor } from '@doctors/entities/doctors.entity';
import { ArgsType, Field, Int, ObjectType, PickType } from '@nestjs/graphql';
import { PaginationArgs } from '@shared/dto/pagination-params.dto';
import { UserStatus } from '@users/entities/user-status-info.entity';
import { IsOptional, IsString } from 'class-validator';

@ObjectType()
export class DoctorsData extends PickType(Doctor, [
  'id',
  'user_name',
  'image_id',
  'image_url',
  'file_path',
  'first_name',
  'last_name',
]) {
  @Field(() => UserStatus)
  status: UserStatus;
}
@ObjectType()
export class GetOrganizationDoctorsResponse {
  @Field(() => [DoctorsData], { nullable: true })
  doctors: DoctorsData[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;
}
@ArgsType()
export class GetOrganizationDoctorsArgs extends PaginationArgs {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @Field(() => String, {
    nullable: true,
  })
  search?: string;
}
