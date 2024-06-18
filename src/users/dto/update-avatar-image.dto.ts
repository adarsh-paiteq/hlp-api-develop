import { i18nValidationMessage } from '@core/modules/i18n-next';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { AvatarType, Users } from '@users/users.model';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';

@InputType()
export class AvatarImageInput {
  @Field(() => String)
  @IsUrl({}, { message: i18nValidationMessage('is_url') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  image_url: string;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  image_id: string;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  file_path: string;
}

@InputType()
export class UpdateAvatarInput {
  @Field(() => AvatarType)
  @IsEnum(AvatarType, { message: i18nValidationMessage('is_enum') })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  avatar_type: AvatarType;

  @Field(() => String, { nullable: true })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  avatar_image_name?: string;

  @Field(() => AvatarImageInput, { nullable: true })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  @IsObject({ message: i18nValidationMessage('is_object') })
  @Type(() => AvatarImageInput)
  image?: AvatarImageInput;
}

@ObjectType()
export class UpdateAvatarResponse {
  @Field(() => Users)
  updatedUser: Users;
}
