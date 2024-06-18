import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field } from '@nestjs/graphql';
import { IsDateString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

@ArgsType()
export class DisableScheduleArgs {
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field()
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  scheduleId: string;

  @Field(() => String)
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  date: string;

  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @Field({ nullable: true })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  habitToolId?: string;
}
