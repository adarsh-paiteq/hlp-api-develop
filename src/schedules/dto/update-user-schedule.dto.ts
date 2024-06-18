import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { UpdateScheduleInput } from './update-schedule.dto';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { i18nValidationMessage } from '@core/modules/i18n-next';

@InputType()
export class UpdateUserScheduleInput extends UpdateScheduleInput {
  @Field()
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  user_id: string;
}

@ObjectType()
export class UpdateUserScheduleResponse {
  @Field(() => String)
  message: string;
}
