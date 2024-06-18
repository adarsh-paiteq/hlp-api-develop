import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, ObjectType } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';

@ObjectType()
export class PurchaseServiceOfferResponse {
  message: string;
}

@ArgsType()
export class PurchaseServiceOfferArgs {
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  serviceOfferId: string;
}
