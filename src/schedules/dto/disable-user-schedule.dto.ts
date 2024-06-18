import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { DisableScheduleArgs } from './disable-schedule.dto';

@ArgsType()
export class DisableUserScheduleArgs extends DisableScheduleArgs {
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field()
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  userId: string;
}
