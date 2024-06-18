import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import {
  GetAppointmentDetailsArgs,
  GetAppointmentDetailsResponse,
} from './get-appointment-details.dto';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { i18nValidationMessage } from '@core/modules/i18n-next';

@ArgsType()
export class GetUserAppointmentDetailsArgs extends GetAppointmentDetailsArgs {
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field(() => String)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  userId: string;
}

@ObjectType()
export class GetUserAppointmentDetailsResponse extends GetAppointmentDetailsResponse {}
