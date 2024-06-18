import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty } from 'class-validator';

@ArgsType()
export class ResendActivationCodeArgs {
  @Field(() => String)
  @IsEmail({}, { message: i18nValidationMessage('is_email') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  email: string;
}

@ObjectType()
export class ResendActivationCodeResponse {
  @Field(() => String)
  message: string;
}
