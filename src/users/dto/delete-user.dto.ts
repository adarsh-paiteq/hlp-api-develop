import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

@ArgsType()
export class DeleteUserArgs {
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @Field()
  id: string;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @Field(() => Boolean, { defaultValue: true })
  remove: boolean;
}

@ObjectType()
export class DeleteUserResponse {
  @Field()
  message: string;
}
