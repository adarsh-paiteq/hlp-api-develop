import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsOptional, IsUUID } from 'class-validator';
import { GraphQLInt } from 'graphql';
import { Form } from '../entities/form.entity';
import { i18nValidationMessage } from '@core/modules/i18n-next';

@ArgsType()
export class GetFormInfoArgs {
  @Field(() => String, {
    nullable: true,
    description: 'toolkitId not required when using this query for appointment',
  })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  toolkitId: string;

  @Field(() => String, {
    nullable: true,
    description: 'formId required when using this query for episodes toolkit',
  })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  formId: string;
}

@ObjectType()
export class GetFormInfoResponse {
  @Field(() => Form)
  form: Form;

  @Field(() => String, { nullable: true })
  pageId?: string;

  @Field(() => GraphQLInt)
  totalPages: number;

  @Field(() => String)
  sessionId: string;
}
