import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { GetPaymentStatus } from '../entities/get-payment-status.entity';

@ArgsType()
export class GetPaymentStatusArgs {
  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  purchaseId: string;
}

@ObjectType()
export class GetPaymentStatusResponse extends GetPaymentStatus {}
