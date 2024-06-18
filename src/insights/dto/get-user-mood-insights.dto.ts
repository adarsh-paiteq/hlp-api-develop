import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import {
  GetMoodInsightsArgsDto,
  GetMoodInsightsResponse,
} from './insights.dto';
import { i18nValidationMessage } from '@core/modules/i18n-next';
import { IsNotEmpty, IsUUID } from 'class-validator';

@ArgsType()
export class GetUserMoodInsightsArgs extends GetMoodInsightsArgsDto {
  @Field()
  @IsUUID('all', { message: i18nValidationMessage('is_uuid') })
  @IsNotEmpty({ message: i18nValidationMessage('is_not_empty') })
  userId: string;
}

@ObjectType()
export class GetUserMoodInsightsResponse extends GetMoodInsightsResponse {}
