import { i18nValidationMessage } from '@core/modules/i18n-next';
import { Doctor } from '@doctors/entities/doctors.entity';
import { ArgsType, Field, ObjectType, PickType } from '@nestjs/graphql';
import { PaginationArgs } from '@shared/dto/pagination-params.dto';
import { IsOptional, IsString } from 'class-validator';
@ArgsType()
export class GetTreatmentDoctorsArgs extends PaginationArgs {
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsString({ message: i18nValidationMessage('is_string') })
  @Field(() => String, { nullable: true })
  search?: string;
}

@ObjectType()
export class TreatmentDoctorsData extends PickType(Doctor, [
  'id',
  'user_name',
  'image_url',
  'image_id',
  'file_path',
  'first_name',
  'last_name',
  'avatar_type',
  'avatar_image_name',
]) {
  @Field(() => String, { nullable: true })
  treatment_id?: string;
}

@ObjectType()
export class GetTreatmentDoctorsResponse {
  @Field(() => [TreatmentDoctorsData], { nullable: true })
  doctors: TreatmentDoctorsData[];

  @Field(() => Boolean, { defaultValue: false })
  hasMore: boolean;
}
