import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Payment, createMollieClient } from '@mollie/api-client';
import { CreatePaymentParameters } from './mollie.dto';
import { EnvVariable } from '@core/configs/config';

@Injectable()
export class MollieService {
  private readonly logger = new Logger(MollieService.name);
  constructor(private readonly configService: ConfigService) {}

  apiKey = this.configService.getOrThrow(EnvVariable.MOLLIE_API_KEY);

  mollieClient = createMollieClient({
    apiKey: this.apiKey,
  });

  async createPayment(
    createPaymentParameters: CreatePaymentParameters,
  ): Promise<Payment> {
    this.logger.log(
      `${this.configService.getOrThrow(
        EnvVariable.NODE_ENV,
      )}, mollie clent apiKey:${this.apiKey}`,
    );
    const payment = await this.mollieClient.payments.create(
      createPaymentParameters,
    );
    return payment;
  }

  async getPaymentDetails(paymentSecret: string): Promise<Payment> {
    const payment = await this.mollieClient.payments.get(paymentSecret);
    return payment;
  }
}
