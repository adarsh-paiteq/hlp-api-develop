import { i18nValidationMessage } from '@core/modules/i18n-next';
import { Doctor } from '@doctors/entities/doctors.entity';
import { ArgsType, Field, Int, ObjectType } from '@nestjs/graphql';
import { PaginationArgs } from '@shared/dto/pagination-params.dto';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

@ArgsType()
export class GetUnassignedTreatmentDoctorsArgs extends PaginationArgs {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field(() => String)
  treatmentId: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @Field(() => String, {
    nullable: true,
  })
  text?: string;
}

@ObjectType()
export class GetUnassignedTreatmentDoctorsResponse {
  @Field(() => [Doctor], { nullable: true })
  doctors: Doctor[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  totalPage: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;
}
