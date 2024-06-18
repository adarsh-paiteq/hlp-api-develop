import { Field, InputType, ObjectType } from '@nestjs/graphql';
import {
  CreateScheduleInput,
  CreateScheduleResponse,
} from './create-schedule.dto';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { i18nValidationMessage } from '@core/modules/i18n-next';

@InputType()
export class CreateUserScheduleInput extends CreateScheduleInput {
  @Field(() => String)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  user_id: string;
}

@ObjectType()
export class CreateUserScheduleResponse extends CreateScheduleResponse {}
