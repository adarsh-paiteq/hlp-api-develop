import { ArgsType, Field, Int, ObjectType } from '@nestjs/graphql';
import { Doctor } from '../entities/doctors.entity';
import { PaginationArgs } from '@shared/dto/pagination-params.dto';
import { i18nValidationMessage } from '@core/modules/i18n-next';
import { IsOptional, IsString } from 'class-validator';

@ArgsType()
export class GetDoctorListArgs extends PaginationArgs {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @Field(() => String, {
    nullable: true,
  })
  search?: string;
}

@ObjectType()
export class DoctorList extends Doctor {
  @Field(() => String)
  organisation_name: string;
}

@ObjectType()
export class GetDoctorListResponse {
  @Field(() => [DoctorList], { nullable: true })
  doctors: DoctorList[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;
}
