import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

@ArgsType()
export class SendChangeDoctorEmailRequestArgs {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsEmail({}, { message: i18nValidationMessage('is_email') })
  @Field()
  email: string;
}

@ObjectType()
export class SendChangeDoctorEmailRequestResponse {
  @Field(() => String)
  message: string;
}

export class UserEmailChangeRequestInput {
  user_id: string;
  email: string;
  token: string;
}
