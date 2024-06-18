import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field } from '@nestjs/graphql';
import { IsJWT, IsNotEmpty } from 'class-validator';

@ArgsType()
export class DoctorRefreshTokenArgs {
  @Field()
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsJWT({ message: i18nValidationMessage('is_jwt') })
  token: string;
}
