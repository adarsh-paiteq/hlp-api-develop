import { Field, ArgsType } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';
import { i18nValidationMessage } from '@core/modules/i18n-next';
@ArgsType()
export class FaqArgs {
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field()
  faqId: string;
}

@ArgsType()
export class FaqCategoryArgs {
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field()
  faqCategoryId: string;
}
