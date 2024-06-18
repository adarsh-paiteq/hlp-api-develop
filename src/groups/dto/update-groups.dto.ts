import { Field, InputType, ObjectType, PartialType } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
} from 'class-validator';
import { i18nValidationMessage } from '@core/modules/i18n-next';
import { DoctorGroup } from '../entities/doctor-group.entity';

@InputType()
export class GroupInput {
  @Field({ nullable: true })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  title?: string;

  @Field({ nullable: true })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  description?: string;

  @Field({ nullable: true })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsUrl({}, { message: i18nValidationMessage('is_url') })
  image_url?: string;

  @Field({ nullable: true })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  image_id?: string;

  @Field({ nullable: true })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  image_file_path?: string;
}
@InputType()
export class UpdateGroupInput {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field(() => String)
  groupId: string;

  @IsObject({ message: i18nValidationMessage('is_object') })
  @Field(() => GroupInput)
  group: GroupInput;
}

export class UpdateGroup extends GroupInput {
  updated_by: string;
  name_id: string;
  short_description: string;
}

@ObjectType()
export class UpdateGroupResponse {
  @Field(() => String)
  message: string;
}
export class DoctorGroupUpdateDto extends PartialType(DoctorGroup) {}
