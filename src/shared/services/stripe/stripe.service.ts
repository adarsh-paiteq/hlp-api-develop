import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

export enum WebhookEventType {
  SUCCEEDED = 'payment_intent.succeeded',
  FAILED = 'payment_intent.payment_failed',
  CANCELED = 'payment_intent.canceled',
}

@Injectable()
export class StripeService {
  private logger = new Logger(StripeService.name);
  private key = this.configService.get<string>('STRIPE_SECRET_KEY') as string;
  private webHookKey = this.configService.get<string>(
    'STRIPE_WEBHOOK_SECRET',
  ) as string;
  public stripe: Stripe;
  constructor(private readonly configService: ConfigService) {
    this.stripe = new Stripe(this.key, { apiVersion: '2022-08-01' });
  }

  public async createPaymentIntents(
    obj: Stripe.PaymentIntentCreateParams,
  ): Promise<Stripe.Response<Stripe.PaymentIntent>> {
    this.logger.log(
      `${this.configService.get<string>('NODE_ENV') as string}, secretKey:${
        this.key
      }`,
    );
    return this.stripe.paymentIntents.create(obj);
  }

  public webhookVerify(payload: string, sig: string): IStripeEvent {
    const event = this.stripe.webhooks.constructEvent(
      payload,
      sig,
      this.webHookKey,
    );
    const object = event.data.object as IStripeEventObject;
    return { ...event, data: { object } };
  }
}

export interface IStripeEvent {
  id: string;
  object: string;
  api_version: string | null;
  created: number;
  data: Data;
  livemode: boolean;
  pending_webhooks: number;
  request: Request | null;
  type: string;
}

export interface Data {
  object: IStripeEventObject;
}

export interface IStripeEventObject {
  id: string;
  object: string;
  amount: number;
  amount_capturable: number;
  amount_received: number;
  application: any;
  application_fee_amount: any;
  automatic_payment_methods: any;
  canceled_at: any;
  cancellation_reason: any;
  capture_method: string;
  charges: Charges;
  client_secret: string;
  confirmation_method: string;
  created: number;
  currency: string;
  customer: any;
  description: string;
  invoice: any;
  last_payment_error: any;
  livemode: boolean;
  metadata: Metadata;
  next_action: any;
  on_behalf_of: any;
  payment_method: any;
  payment_method_options: PaymentMethodOptions;
  payment_method_types: string[];
  processing: any;
  receipt_email: any;
  review: any;
  setup_future_usage: any;
  shipping: Shipping;
  source: any;
  statement_descriptor: any;
  statement_descriptor_suffix: any;
  status: string;
  transfer_data: any;
  transfer_group: any;
}

export interface Shipping {
  address: Address;
  carrier: any;
  name: string;
  phone: any;
  tracking_number: any;
}

export interface Address {
  city: string;
  country: string;
  line1: string;
  line2: any;
  postal_code: string;
  state: string;
}

export interface Charges {
  object: string;
  data: any[];
  has_more: boolean;
  total_count: number;
  url: string;
}

export interface Metadata {
  purchaseId?: string;
  serviceOfferPurchaseId?: string;
}

export interface PaymentMethodOptions {
  card: Card;
}

export interface Card {
  installments: any;
  mandate_options: any;
  network: any;
  request_three_d_secure: string;
}

export interface Request {
  id: string | null;
  idempotency_key: string | null;
}
