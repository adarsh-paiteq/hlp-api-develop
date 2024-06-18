import { Field, InputType } from '@nestjs/graphql';
import { PickType } from '@nestjs/mapped-types';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  Length,
} from 'class-validator';
import { ContentEditor } from '../entities/content-editor.entity';
import { i18nValidationMessage } from '@core/modules/i18n-next';

@InputType()
export class AddContentEditorInput extends PickType(ContentEditor, [
  'email',
  'first_name',
  'last_name',
  'mobile_number',
  'image_id',
  'image_url',
  'file_path',
]) {
  @Field(() => String)
  @IsEmail({}, { message: i18nValidationMessage('is_email') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  email: string;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  first_name: string;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  last_name: string;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  image_id: string;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  image_url: string;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  file_path: string;

  @Field(() => String)
  @IsPhoneNumber(undefined, {
    message: i18nValidationMessage('is_phone_number'),
  })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  mobile_number: string;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Length(8, 8, { message: i18nValidationMessage('min_length_8') })
  password: string;

  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @Field(() => Boolean, { defaultValue: true })
  status: boolean;
}
