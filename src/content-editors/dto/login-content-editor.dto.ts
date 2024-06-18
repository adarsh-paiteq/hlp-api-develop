import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

@ArgsType()
export class ContentEditorLoginArgs {
  @Field(() => String)
  @IsEmail({}, { message: i18nValidationMessage('is_email') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  email: string;

  @Field(() => String)
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  password: string;
}
