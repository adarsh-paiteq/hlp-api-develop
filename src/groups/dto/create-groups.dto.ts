import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { i18nValidationMessage } from '@core/modules/i18n-next';

@InputType()
export class CreateGroupInput {
  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  title: string;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  description: string;

  @Field(() => String, { nullable: true })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsUrl({}, { message: i18nValidationMessage('is_url') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  image_url?: string;

  @Field(() => String, { nullable: true })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  image_id?: string;

  @Field(() => String, { nullable: true })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  image_file_path?: string;
}

@ObjectType()
export class CreateGroupOutput {
  @Field(() => String)
  message: string;
}

export class InsertGroup extends CreateGroupInput {
  is_deleted: boolean;
  updated_by: string;
  created_by: string;
  name_id: string;
  short_description: string;
  total_followers: number;
  default_channel: boolean;
  is_private: boolean;
}

export class InsertDoctorGroup {
  is_owner: boolean;
  updated_by: string;
  created_by: string;
  user_id: string;
  channel_id: string;
  is_channel_unfollowed: boolean;
  organisation_id: string;
}
