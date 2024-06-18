import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { UserSchedule } from './get-dashboard.dto';
import { PaginationArgs } from '@shared/dto/pagination-params.dto';
import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator';
import { i18nValidationMessage } from '@core/modules/i18n-next';

@ArgsType()
export class GetPatientAgendaArgs extends PaginationArgs {
  @Field(() => String)
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  user_id: string;

  @Field(() => String)
  @IsDateString({}, { message: i18nValidationMessage('is_date_string') })
  date: string;
}

@ObjectType()
export class GetPatientAgendaResponse {
  @Field(() => [UserSchedule], { nullable: 'items' })
  agenda: UserSchedule[];

  @Field(() => Boolean)
  has_more: boolean;
}
