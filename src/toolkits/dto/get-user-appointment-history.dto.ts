import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';
import {
  GetAppointmentHistoryArgs,
  GetAppointmentHistoryResponse,
} from './get-appointment-history.dto';

@ArgsType()
export class GetUserAppointmentHistoryArgs extends GetAppointmentHistoryArgs {
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field(() => String)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  userId: string;
}

@ObjectType()
export class GetUserAppointmentHistoryResponse extends GetAppointmentHistoryResponse {}
