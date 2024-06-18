import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsNotEmpty, IsUUID } from 'class-validator';

@ArgsType()
export class UpdateTreatmentTimelineRobotStatusArgs {
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @Field()
  is_robot_read: boolean;

  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  notification_id: string;
}

@ObjectType()
export class UpdateTreatmentTimelineRobotStatusResponse {
  @Field(() => String)
  message: string;
}
