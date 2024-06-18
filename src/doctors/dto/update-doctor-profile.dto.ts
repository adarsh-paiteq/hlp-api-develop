import { Field, InputType, ObjectType } from '@nestjs/graphql';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
} from 'class-validator';
import { i18nValidationMessage } from '@core/modules/i18n-next';
import { Gender } from '@users/users.model';

@InputType()
export class VideosInput {
  @Field()
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUrl({}, { message: i18nValidationMessage('is_url') })
  video_url: string;

  @Field()
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  video_path: string;

  @Field()
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  video_id: string;

  @Field()
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUrl({}, { message: i18nValidationMessage('is_url') })
  thumbnail_image_url: string;

  @Field()
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  thumbnail_image_id_path: string;

  @Field()
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  thumbnail_image_id: string;

  @Field()
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  video_name: string;
}

@InputType()
export class UpdateDoctorProfileInput {
  @Field({ nullable: true })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  first_name?: string;

  @Field({ nullable: true })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  last_name?: string;

  @Field(() => Gender, {
    nullable: true,
    description: `Gender must be ${Object.values(Gender)}`,
  })
  @IsEnum(Gender, { message: i18nValidationMessage('is_enum') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  gender?: Gender;

  @Field({ nullable: true })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsUrl({}, { message: i18nValidationMessage('is_url') })
  image_url: string;

  @Field({ nullable: true })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  image_id: string;

  @Field({ nullable: true })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  file_path: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @Field({ nullable: true })
  about_me?: string;

  @IsArray()
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @Field(() => [VideosInput], { nullable: true })
  videos?: VideosInput[];

  @IsUUID('all', { message: i18nValidationMessage('is_uuid'), each: true })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @Field(() => [String], { nullable: true, description: 'specialities ids' })
  speciality_ids?: string[];
}

@ObjectType()
export class UpdateDoctorProfileResponse {
  @Field(() => String)
  message: string;
}

export class DoctorSpecialitiesDTO {
  doctor_id: string;
  speciality_id: string;
}

export class DoctorProfileVideoDTO extends VideosInput {
  doctor_id: string;
}
