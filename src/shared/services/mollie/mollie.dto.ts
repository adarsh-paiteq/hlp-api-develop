import { i18nValidationMessage } from '@core/modules/i18n-next';
import { Amount } from '@mollie/api-client/dist/types/src/data/global';
import { IsNotEmpty, IsString } from 'class-validator';

export interface Address {
  givenName?: string;
  familyName?: string;
  streetAndNumber: string;
  streetAdditional?: string;
  postalCode: string;
  city: string;
  region?: string;
  country: string;
}

export class CreatePaymentParameters {
  amount: Amount;
  shippingAddress: Address;
  description: string;
  redirectUrl: string;
  webhookUrl?: string;
  metadata: Metadata;
}

export class Metadata {
  //TODO: add required data
  order_id: string;
  purchase_id: string;
}

export class WebhookRequestBody {
  @IsString({ message: i18nValidationMessage('is_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  id: string;
}
