import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

@ArgsType()
export class DeleteTreatmentTimelineMessageArgs {
  @Field(() => String, { description: 'Treatment id' })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  treatmentId: string;

  @Field(() => String, { description: 'Treatment timeline message id' })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  timelineMessageId: string;

  @Field(() => String, { nullable: true, description: 'schedule/agenda id' })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  scheduleId?: string;
}

@ObjectType()
export class DeleteTreatmentTimelineMessageResponse {
  @Field(() => String)
  message: string;
}
