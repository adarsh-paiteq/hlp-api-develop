import { i18nValidationMessage } from '@core/modules/i18n-next';
import { Field, InputType, ObjectType } from '@nestjs/graphql';

import { IsNotEmpty, IsString, IsUUID, MinLength } from 'class-validator';

@InputType()
export class ChangeUserPasswordInput {
  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  id: string;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @MinLength(8, { message: i18nValidationMessage('min_length_8') })
  password: string;
}

@ObjectType()
export class ChangedPasswordResponse {
  @Field(() => String)
  message: string;
}
