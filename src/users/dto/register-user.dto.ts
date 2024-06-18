import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { i18nValidationMessage } from '@core/modules/i18n-next';
import { Gender } from '@users/users.model';

@InputType()
export class RegisterUserInput {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsEmail({}, { message: i18nValidationMessage('is_email":') })
  @Field(() => String)
  email: string;

  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @MinLength(8, { message: i18nValidationMessage('min_length_8') })
  @Field(() => String)
  password: string;
}

@ObjectType()
export class RegisterUserResponse {
  @Field(() => String)
  id: string;

  @Field(() => String)
  access_token: string;

  @Field(() => String)
  refresh_token: string;

  @Field(() => String)
  token_type: string;

  @Field(() => Int)
  expires_in: number;

  @Field(() => String)
  external_user_id_auth_Hash: string;

  @Field(() => String)
  email_auth_hash: string;
}

export class SaveUserInput {
  role: string;
  age_group: string;
  last_login_time: Date;
  accepted_terms_and_conditions: boolean;
  first_name?: string | null;
  full_name?: string | null;
  gender?: Gender | null;
  email: string;
  password: string;
  date_of_birth: string;
  organization_id: string;
  oauth_user_id: string;
  invitation_id?: string;
}
