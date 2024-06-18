import { ArgsType, Field, ObjectType, OmitType } from '@nestjs/graphql';
import {
  IsDateString,
  IsDefined,
  IsEmail,
  IsString,
  Length,
} from 'class-validator';
import { AgeGroups } from '../users/users.dto';

@ArgsType()
export class VerifyPukArgs {
  @IsString()
  @IsDefined()
  @Field(() => String, { description: 'eg. CTO78L' })
  @Length(6, 6)
  activationCode: string;

  @IsDateString({ strict: true })
  @IsDefined()
  @Field(() => String, { description: 'ISO format, eg. 2022-01-27' })
  birthDate: string;

  @IsEmail()
  @IsDefined()
  email: string;
}

@ArgsType()
export class ResendActivationCodeArgs extends OmitType(VerifyPukArgs, [
  'activationCode',
]) {}

@ObjectType()
export class PukVerifyApiResponse {
  success: boolean;
  userIdPuk: number;
}

@ObjectType()
export class VerifyPukOutput {
  puk_reference_id: string;
  age_group: AgeGroups;
}

@ArgsType()
export class ActivityApiArgs {
  @IsString()
  userIdPuk: string;
}

@ObjectType()
export class ActivityApiResponse {
  success: boolean;
  @Field(() => String, { nullable: true })
  msg?: string;
}

@ArgsType()
export class RegistrationConfirmationApiArgs extends ActivityApiArgs {}

@ObjectType()
export class RegistrationConfirmationApiResponse extends ActivityApiResponse {}

@ObjectType()
export class PukResendActivationCodeApiResponse extends ActivityApiResponse {}
