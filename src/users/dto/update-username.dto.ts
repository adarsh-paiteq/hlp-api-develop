import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@ArgsType()
export class UpdateUsernameArgs {
  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  user_name: string;
}

@ObjectType()
export class UpdateUsernameResponse {
  @Field(() => String)
  message: string;
}
