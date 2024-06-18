import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsJWT, IsNotEmpty, IsString } from 'class-validator';

@ArgsType()
export class ResendUserLoginOtpArgs {
  @IsJWT({ message: i18nValidationMessage('is_jwt') })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field(() => String)
  token: string;
}

@ObjectType()
export class ResendUserLoginOtpResponse {
  @Field(() => String)
  message: string;
}
