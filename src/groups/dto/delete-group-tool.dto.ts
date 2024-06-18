import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

@ObjectType()
export class DeleteGroupToolResponse {
  @Field(() => String)
  message: string;
}

@ArgsType()
export class DeleteGroupToolArgs {
  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsString({ message: i18nValidationMessage('is_string') })
  groupId: string;

  @Field(() => String)
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsString({ message: i18nValidationMessage('is_string') })
  toolKitId: string;
}
