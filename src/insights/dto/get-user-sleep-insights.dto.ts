import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import {
  GetMoodInsightsArgsDto,
  GetSleepInsightsResponse,
} from './insights.dto';
import { i18nValidationMessage } from '@core/modules/i18n-next';
import { IsNotEmpty, IsUUID } from 'class-validator';

@ArgsType()
export class GetUserSleepInsightsArgs extends GetMoodInsightsArgsDto {
  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  userId: string;
}

@ObjectType()
export class GetUserSleepInsightsResponse extends GetSleepInsightsResponse {}
