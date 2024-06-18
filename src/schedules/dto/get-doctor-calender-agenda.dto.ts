import { i18nValidationMessage } from '@core/modules/i18n-next';
import { ArgsType, Field, InputType, ObjectType } from '@nestjs/graphql';
import {
  IsBoolean,
  IsDateString,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { CalenderAgenda } from './get-user-calender-agenda.dto';
import { Type } from 'class-transformer';

@InputType()
export class AgendaFilter {
  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @Field(() => Boolean, { nullable: true })
  show_appointment?: boolean;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @IsBoolean({ message: i18nValidationMessage('is_boolean') })
  @Field(() => Boolean, { nullable: true })
  show_activity?: boolean;
}
@ArgsType()
export class GetDoctorCalenderAgendaArgs {
  @Field(() => String)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  @IsISO8601({ strict: true }, { message: i18nValidationMessage('IsISO8601') })
  startDate: string;

  @Field(() => String)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  @IsISO8601({ strict: true }, { message: i18nValidationMessage('IsISO8601') })
  endDate: string;

  @IsOptional({ message: i18nValidationMessage('is_optional') })
  @Type(() => AgendaFilter)
  @ValidateNested({ message: i18nValidationMessage('validated_nested') })
  @Field(() => AgendaFilter, { nullable: true })
  filters?: AgendaFilter;
}

@ObjectType()
export class GetDoctorCalenderAgendaResponse {
  @Field(() => [CalenderAgenda], { nullable: 'items' })
  calenderAgenda: CalenderAgenda[];
}
