import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { OauthUser } from '@oauth/entities/oauth-users.entity';
import { IsNotEmpty, IsString } from 'class-validator';

@ArgsType()
export class VerifyActivationCodeArgs {
  @Field(() => String)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsString({ message: i18nValidationMessage('is_string') })
  code: string;
}

@ObjectType()
export class VerifyActivationCodeResponse {
  @Field(() => OauthUser)
  oauthUser: OauthUser;
}
