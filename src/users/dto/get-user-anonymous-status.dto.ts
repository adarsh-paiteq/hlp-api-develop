import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { i18nValidationMessage } from '@core/modules/i18n-next';

@ArgsType()
export class GetUserAnonymousStatusArgs {
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field(() => String)
  id: string;
}

@ObjectType()
export class GetUserAnonymousStatusResponse {
  @Field(() => Boolean)
  is_profile_anonymous: boolean;
}
