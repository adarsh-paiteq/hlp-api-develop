import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsJWT, IsNotEmpty, IsString } from 'class-validator';

@ArgsType()
export class ResendDoctorLoginOtpArgs {
  @IsJWT({ message: i18nValidationMessage('is_jwt') })
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field()
  token: string;
}

@ObjectType()
export class ResendDoctorLoginOtpResponse {
  @Field(() => String)
  message: string;
}
